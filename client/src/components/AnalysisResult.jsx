import React, { useState } from 'react';
import RiskBadge from './RiskBadge';

// ─── Color tokens ────────────────────────────────────────────────────────────
const C = {
  bg:           '#0A0A0F',
  surface:      '#111118',
  accent:       '#6366F1',
  textPrimary:  '#F1F5F9',
  textMuted:    '#94A3B8',
  border:       '#1E1E2E',
  surfaceHover: '#1A1A24',
  riskHigh:     '#EF4444',
  riskMedium:   '#F59E0B',
  riskLow:      '#22C55E',
};

// ─── Reusable section label ───────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{
      color:          C.accent,
      fontFamily:     "'Inter', sans-serif",
      fontSize:       '12px',
      fontWeight:     '500',
      textTransform:  'uppercase',
      letterSpacing:  '0.08em',
      marginBottom:   '16px',
    }}>
      {children}
    </div>
  );
}

// ─── Language pill ────────────────────────────────────────────────────────────
function LanguagePill({ language }) {
  return (
    <span style={{
      display:         'inline-flex',
      alignItems:      'center',
      backgroundColor: C.surfaceHover,
      color:           C.textMuted,
      fontSize:        '12px',
      fontWeight:      '500',
      fontFamily:      "'Inter', sans-serif",
      padding:         '4px 10px',
      borderRadius:    '999px',
      whiteSpace:      'nowrap',
    }}>
      {language}
    </span>
  );
}

// ─── Risk severity border color ───────────────────────────────────────────────
function severityColor(severity) {
  const s = (severity || 'low').toLowerCase();
  if (s === 'high')   return C.riskHigh;
  if (s === 'medium') return C.riskMedium;
  return C.riskLow;
}

// ─── Hover-aware button ───────────────────────────────────────────────────────
function OutlineButton({ onClick, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: 'transparent',
        border:          `1px solid ${hovered ? C.accent : C.border}`,
        color:           hovered ? C.accent : C.textMuted,
        fontFamily:      "'Inter', sans-serif",
        fontSize:        '13px',
        fontWeight:      '500',
        padding:         '8px 16px',
        borderRadius:    '6px',
        cursor:          'pointer',
        transition:      'color 0.15s ease, border-color 0.15s ease',
      }}
    >
      {children}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AnalysisResult({ result, onReset }) {
  const {
    summary           = '',
    risk_level        = 'low',
    risk_clauses      = [],
    missing_protections = [],
    recommended_actions = [],
    language          = 'English',
  } = result;

  return (
    <div style={{
      width:         '100%',
      maxWidth:      '720px',
      margin:        '0 auto',
      paddingBottom: '80px',
      display:       'flex',
      flexDirection: 'column',
      gap:           '32px',
    }}>

      {/* ── A) Page Header ─────────────────────────────────────────────────── */}
      <div>
        <h1 style={{
          margin:        '0 0 12px 0',
          fontFamily:    "'Inter', sans-serif",
          fontSize:      '28px',
          fontWeight:    '600',
          color:         C.textPrimary,
          letterSpacing: '-0.02em',
        }}>
          Contract Analysis
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <RiskBadge level={risk_level} />
          <LanguagePill language={language} />
        </div>
      </div>

      {/* ── B) Summary Card ────────────────────────────────────────────────── */}
      <div style={{
        backgroundColor: C.surface,
        border:          `1px solid ${C.border}`,
        borderRadius:    '10px',
        padding:         '24px',
      }}>
        <SectionLabel>Summary</SectionLabel>
        <p style={{
          margin:      0,
          fontFamily:  "'Inter', sans-serif",
          fontSize:    '15px',
          fontWeight:  '400',
          color:       C.textMuted,
          lineHeight:  '1.7',
        }}>
          {summary}
        </p>
      </div>

      {/* ── C) Risk Clauses ────────────────────────────────────────────────── */}
      <div>
        <SectionLabel>Risk Clauses</SectionLabel>
        {risk_clauses.length === 0 ? (
          <p style={{
            margin:     0,
            fontFamily: "'Inter', sans-serif",
            fontSize:   '14px',
            color:      C.textMuted,
          }}>
            No significant risk clauses detected.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {risk_clauses.map((item, i) => (
              <div key={i} style={{
                backgroundColor: C.surface,
                borderLeft:      `3px solid ${severityColor(item.severity)}`,
                borderRadius:    '8px',
                padding:         '16px',
              }}>
                <div style={{
                  fontFamily:   "'JetBrains Mono', monospace",
                  fontSize:     '13px',
                  color:        C.textPrimary,
                  marginBottom: '8px',
                  lineHeight:   '1.5',
                }}>
                  "{item.clause}"
                </div>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize:   '14px',
                  color:      C.textMuted,
                }}>
                  Flagged keyword: <span style={{ color: severityColor(item.severity) }}>{item.risk}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── D) Missing Protections ─────────────────────────────────────────── */}
      <div>
        <SectionLabel>Missing Protections</SectionLabel>
        <div style={{
          backgroundColor: C.surface,
          border:          `1px solid ${C.border}`,
          borderRadius:    '10px',
          overflow:        'hidden',
        }}>
          {missing_protections.map((item, i) => (
            <div key={i} style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '12px',
              padding:      '14px 20px',
              borderBottom: i < missing_protections.length - 1
                ? `1px solid ${C.border}`
                : 'none',
            }}>
              <span style={{
                color:      C.riskMedium,
                fontSize:   '14px',
                flexShrink: 0,
                lineHeight: 1,
              }}>⚠</span>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize:   '14px',
                color:      C.textMuted,
              }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── E) Recommended Actions ─────────────────────────────────────────── */}
      <div>
        <SectionLabel>Recommended Actions</SectionLabel>
        <div style={{
          backgroundColor: C.surface,
          border:          `1px solid ${C.border}`,
          borderRadius:    '10px',
          overflow:        'hidden',
        }}>
          {recommended_actions.map((item, i) => (
            <div key={i} style={{
              display:      'flex',
              alignItems:   'flex-start',
              gap:          '16px',
              padding:      '16px 20px',
              borderBottom: i < recommended_actions.length - 1
                ? `1px solid ${C.border}`
                : 'none',
            }}>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize:   '14px',
                fontWeight: '600',
                color:      C.accent,
                flexShrink: 0,
                minWidth:   '20px',
                lineHeight: '1.5',
              }}>
                {i + 1}.
              </span>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize:   '14px',
                fontWeight: '400',
                color:      C.textPrimary,
                lineHeight: '1.5',
              }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── F) Footer ──────────────────────────────────────────────────────── */}
      <div>
        <div style={{
          height:          '1px',
          backgroundColor: C.border,
          marginBottom:    '20px',
        }} />
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          flexWrap:       'wrap',
          gap:            '12px',
        }}>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize:   '12px',
            color:      C.textMuted,
          }}>
            Analyzed by NoirBytes · LexAI
          </span>
          <OutlineButton onClick={onReset}>
            Analyze another contract
          </OutlineButton>
        </div>
      </div>

    </div>
  );
}
