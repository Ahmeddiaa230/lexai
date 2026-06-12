const express = require('express');
const router = express.Router();
const db = require('../db');

// Read between the lines - LexAI Contract Analyzer Route
// Built by NoirBytes

// ─────────────────────────────────────────────────────────────────────────────
// TODO: Replace mockAnalyze() with Anthropic API call when key is available
// ─────────────────────────────────────────────────────────────────────────────
async function mockAnalyze(text) {
  // Simulate network/processing latency
  await new Promise((r) => setTimeout(r, 1500));

  const lower = text.toLowerCase();

  // ── Risk Level ──────────────────────────────────────────────────────────────
  const highKeywords   = ['indemnif', 'unlimited liability', 'irrevocable', 'perpetual'];
  const mediumKeywords = ['terminat', 'penalty', 'warranty', 'exclusive'];

  let risk_level = 'low';
  if (highKeywords.some((kw) => lower.includes(kw)))   risk_level = 'high';
  else if (mediumKeywords.some((kw) => lower.includes(kw))) risk_level = 'medium';

  // ── Risk Clauses ─────────────────────────────────────────────────────────────
  // All sentinel keywords mapped to their severity tier
  const keywordMap = [
    ...highKeywords.map((kw)   => ({ kw, severity: 'high' })),
    ...mediumKeywords.map((kw) => ({ kw, severity: 'medium' })),
  ];

  // Split on sentence-ending punctuation to get candidate sentences
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const risk_clauses = [];
  for (const { kw, severity } of keywordMap) {
    if (risk_clauses.length >= 3) break;
    const match = sentences.find(
      (s) => s.toLowerCase().includes(kw) &&
             !risk_clauses.some((rc) => rc.clause === s.substring(0, 100))
    );
    if (match) {
      risk_clauses.push({
        clause:   match.substring(0, 100),
        risk:     kw,
        severity,
      });
    }
  }

  // ── Language Detection ───────────────────────────────────────────────────────
  // Test for presence of any Arabic Unicode codepoint (U+0600–U+06FF)
  const language = /[\u0600-\u06FF]/.test(text) ? 'Arabic' : 'English';

  // ── Assembled Result ─────────────────────────────────────────────────────────
  return {
    summary: text.trim().substring(0, 200) + '...',
    risk_level,
    risk_clauses,
    language,
    missing_protections: [
      'Dispute resolution clause',
      'Force majeure clause',
      'Limitation of liability cap',
    ],
    recommended_actions: [
      'Have a lawyer review before signing',
      'Clarify termination conditions',
      'Negotiate liability limits',
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/analyze/:id
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:id', async (req, res) => {
  const { id } = req.params;

  // ── 1. Fetch record ──────────────────────────────────────────────────────────
  let record;
  try {
    record = db
      .prepare('SELECT * FROM analyses WHERE id = ?')
      .get(id);
  } catch (dbErr) {
    console.error('[NoirBytes DB Fetch Error]:', dbErr.message);
    return res.status(500).json({
      error: 'Failed to retrieve analysis record.',
      code:  'DB_FETCH_ERROR',
    });
  }

  if (!record) {
    return res.status(404).json({
      error: 'No analysis record found for the provided id.',
      code:  'RECORD_NOT_FOUND',
    });
  }

  // ── 2. Guard: reject if already processing ───────────────────────────────────
  if (record.status === 'analyzing') {
    return res.status(409).json({
      error: 'Analysis is already in progress for this contract.',
      code:  'ANALYSIS_IN_PROGRESS',
    });
  }

  // ── 3. Mark as 'analyzing' ───────────────────────────────────────────────────
  try {
    db.prepare("UPDATE analyses SET status = 'analyzing', error_message = NULL WHERE id = ?")
      .run(id);
  } catch (dbErr) {
    console.error('[NoirBytes DB Status Update Error]:', dbErr.message);
    return res.status(500).json({
      error: 'Failed to update analysis status.',
      code:  'DB_UPDATE_ERROR',
    });
  }

  // ── 4. Run analysis ──────────────────────────────────────────────────────────
  let result;
  try {
    result = await mockAnalyze(record.extracted_text);
  } catch (analysisErr) {
    console.error('[NoirBytes Analysis Error]:', analysisErr.message);

    try {
      db.prepare("UPDATE analyses SET status = 'error', error_message = ? WHERE id = ?")
        .run(analysisErr.message || 'Analysis failed unexpectedly.', id);
    } catch (dbErr) {
      console.error('[NoirBytes DB Error-Save Error]:', dbErr.message);
    }

    return res.status(503).json({
      error: 'Analysis failed. Please try again later.',
      code:  'ANALYSIS_FAILED',
    });
  }

  // ── 5. Persist result ────────────────────────────────────────────────────────
  try {
    db.prepare(
      "UPDATE analyses SET status = 'complete', result_json = ?, error_message = NULL WHERE id = ?"
    ).run(JSON.stringify(result), id);
  } catch (dbErr) {
    console.error('[NoirBytes DB Result-Save Error]:', dbErr.message);

    try {
      db.prepare("UPDATE analyses SET status = 'error', error_message = ? WHERE id = ?")
        .run('Failed to persist analysis result.', id);
    } catch (innerErr) {
      console.error('[NoirBytes DB Cascade Error]:', innerErr.message);
    }

    return res.status(503).json({
      error: 'Analysis completed but result could not be saved.',
      code:  'DB_RESULT_SAVE_ERROR',
    });
  }

  // ── 6. Return result ─────────────────────────────────────────────────────────
  return res.status(200).json(result);
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analyze/:id  — Poll for status / retrieve cached result
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const { id } = req.params;

  let record;
  try {
    record = db
      .prepare(
        'SELECT id, filename, original_name, upload_date, status, result_json, error_message FROM analyses WHERE id = ?'
      )
      .get(id);
  } catch (dbErr) {
    console.error('[NoirBytes DB Fetch Error]:', dbErr.message);
    return res.status(500).json({
      error: 'Failed to retrieve analysis record.',
      code:  'DB_FETCH_ERROR',
    });
  }

  if (!record) {
    return res.status(404).json({
      error: 'No analysis record found for the provided id.',
      code:  'RECORD_NOT_FOUND',
    });
  }

  let result = null;
  if (record.result_json) {
    try {
      result = JSON.parse(record.result_json);
    } catch {
      result = record.result_json;
    }
  }

  return res.status(200).json({
    id:            record.id,
    filename:      record.filename,
    original_name: record.original_name,
    upload_date:   record.upload_date,
    status:        record.status,
    result,
    error_message: record.error_message,
  });
});

module.exports = router;
