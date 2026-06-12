const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const crypto = require('crypto');
const db = require('../db');

// Read between the lines - LexAI PDF Uploader Route
// Built by NoirBytes

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomUUID();
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    const err = new Error('Invalid file type. Only application/pdf is allowed.');
    err.code = 'INVALID_FILE_TYPE';
    cb(err);
  }
};

const maxFileSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10);

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSizeMB * 1024 * 1024 
  }
});

router.post('/', (req, res) => {
  upload.single('contract')(req, res, async (err) => {
    if (err) {
      console.error('[NoirBytes Upload Error]:', err.message);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            error: `File is too large. Maximum allowed size is ${maxFileSizeMB}MB.`, 
            code: 'FILE_TOO_LARGE' 
          });
        }
        return res.status(400).json({ error: err.message, code: err.code || 'MULTER_ERROR' });
      }
      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({ error: err.message, code: 'INVALID_FILE_TYPE' });
      }
      return res.status(500).json({ error: 'An unexpected error occurred during upload.', code: 'INTERNAL_UPLOAD_ERROR' });
    }

    if (!req.file) {
      console.error('[NoirBytes Upload Error]: No file uploaded');
      return res.status(400).json({ error: 'No file uploaded. Please upload a PDF contract.', code: 'NO_FILE_UPLOADED' });
    }

    const filePath = req.file.path;
    let extractedText = '';

    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(dataBuffer);
      extractedText = pdfData.text || '';
    } catch (parseErr) {
      console.error('[NoirBytes PDF Extraction Error]:', parseErr.message);
      try { 
        fs.unlinkSync(filePath); 
      } catch (unlinkErr) { 
        console.error('[NoirBytes Cleanup Error]:', unlinkErr.message);
      }
      return res.status(422).json({ 
        error: 'Could not extract text from PDF', 
        code: 'TEXT_EXTRACTION_FAILED' 
      });
    }

    // Clean up temporary file immediately after successful extraction
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkErr) {
      console.error('[NoirBytes Cleanup Error]:', unlinkErr.message);
    }

    // Validate extracted text length
    if (extractedText.trim().length < 100) {
      console.error('[NoirBytes Validation Error]: Extracted text under 100 chars');
      return res.status(422).json({ 
        error: 'PDF appears to be empty or scanned image', 
        code: 'PDF_EMPTY_OR_SCANNED' 
      });
    }

    try {
      const id = crypto.randomUUID();
      const filename = req.file.filename;
      const originalName = req.file.originalname;
      const uploadDate = new Date().toISOString();
      const status = 'pending';

      const stmt = db.prepare(`
        INSERT INTO analyses (id, filename, original_name, upload_date, status, extracted_text)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, filename, originalName, uploadDate, status, extractedText);

      return res.status(201).json({
        id,
        filename,
        char_count: extractedText.length,
        preview: extractedText.trim().substring(0, 300)
      });
    } catch (dbErr) {
      console.error('[NoirBytes DB Save Error]:', dbErr.message);
      return res.status(500).json({ 
        error: 'Failed to save analysis record', 
        code: 'DB_SAVE_ERROR' 
      });
    }
  });
});

module.exports = router;
