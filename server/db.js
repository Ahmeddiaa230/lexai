const Database = require('better-sqlite3');
const path = require('path');

// Read between the lines - LexAI Database Initializer
// Built by NoirBytes

// Ensure the database is created in the lexai project root directory
const dbPath = path.resolve(__dirname, '../lexai.db');
const db = new Database(dbPath, { verbose: console.log });

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS analyses (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    upload_date TEXT NOT NULL,
    status TEXT NOT NULL,
    extracted_text TEXT,
    result_json TEXT,
    error_message TEXT
  );
`);

module.exports = db;
