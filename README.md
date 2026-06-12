# ⚖️ LexAI — Read between the lines.

> AI-powered contract analyzer. Upload your PDF and get instant risk analysis.

Built by **NoirBytes** · Full-stack Node.js + React application.

---

## 📌 What is LexAI?

LexAI is a dark-themed, minimal web application that analyzes legal contracts uploaded as PDFs. It extracts the text, scans for risk indicators, and returns a structured breakdown including:

- **Risk level** (Low / Medium / High)
- **Flagged risk clauses** with severity indicators
- **Missing legal protections** (e.g. force majeure, dispute resolution)
- **Recommended actions** for the user
- **Language detection** (Arabic / English)
- **Contract summary**

The UI is designed to feel like a premium legal SaaS product — dark, minimal, and precise.

---

## 🗂️ Project Structure

```
lexai/
├── server/                  # Express backend (Node.js)
│   ├── app.js               # Server entry point — middleware, routes, error handling
│   ├── db.js                # SQLite database init (better-sqlite3)
│   ├── routes/
│   │   ├── upload.js        # POST /api/upload — PDF upload + text extraction
│   │   └── analyze.js       # POST /api/analyze/:id — contract analysis engine
│   └── uploads/             # Temp PDF storage (auto-deleted after extraction)
│
├── client/                  # React frontend (Vite)
│   ├── index.html           # Vite entry — fonts, favicon, meta
│   ├── vite.config.js       # Vite config + /api proxy → localhost:3001
│   └── src/
│       ├── main.jsx         # React 18 createRoot entry
│       ├── App.jsx          # App shell — state machine (upload→analyzing→result→error)
│       ├── api/
│       │   └── client.js    # uploadPDF() + analyzePDF() fetch wrappers
│       └── components/
│           ├── UploadZone.jsx      # Drag & drop PDF uploader
│           ├── AnalysisResult.jsx  # Full result display (6 sections)
│           └── RiskBadge.jsx       # Colored risk level pill component
│
├── package.json             # Server dependencies
├── .env.example             # Environment variables template
└── .gitignore
```

---

## 🔁 How It Works

```
User uploads PDF
      │
      ▼
POST /api/upload
  → Multer validates file (PDF only, max 10MB)
  → pdf-parse extracts text
  → Validates: text must be ≥ 100 chars
  → Saves record to SQLite (status: 'pending')
  → Returns { id, filename, char_count, preview }
      │
      ▼
POST /api/analyze/:id
  → Fetches record from SQLite by id
  → Runs mockAnalyze(text):
      - Keyword scan → risk_level
      - Sentence extraction → risk_clauses (up to 3)
      - Arabic Unicode detection → language
      - Fixed missing_protections + recommended_actions
      - Simulates 1.5s processing delay
  → Updates SQLite record (status: 'complete', result_json)
  → Returns structured result object
      │
      ▼
React renders AnalysisResult
  → Summary card
  → Risk clauses (JetBrains Mono, colored by severity)
  → Missing protections list
  → Numbered recommended actions
  → Footer with reset button
```

---

## 🧪 Analysis Engine

The current engine is a **mock analyzer** (`mockAnalyze()`) using keyword matching — intentionally designed as a drop-in replacement for a real AI model.

```js
// TODO: Replace mockAnalyze() with Anthropic API call when key is available
```

**Risk detection keywords:**

| Level | Keywords |
|---|---|
| 🔴 High | `indemnif`, `unlimited liability`, `irrevocable`, `perpetual` |
| 🟡 Medium | `terminat`, `penalty`, `warranty`, `exclusive` |
| 🟢 Low | *(none of the above)* |

---

## 🛠️ Tech Stack

### Backend
| Package | Purpose |
|---|---|
| `express` | HTTP server framework |
| `better-sqlite3` | Synchronous SQLite database |
| `multer` | Multipart file upload handler |
| `pdf-parse` | PDF text extraction |
| `@anthropic-ai/sdk` | Claude AI integration (ready, not yet active) |
| `helmet` | Security HTTP headers |
| `cors` | Cross-origin resource sharing |
| `express-rate-limit` | 100 req / 15 min per IP |
| `dotenv` | Environment variable loader |

### Frontend
| Package | Purpose |
|---|---|
| `react` + `react-dom` | UI framework (v18) |
| `vite` | Dev server + bundler |
| `@vitejs/plugin-react` | JSX + Fast Refresh |

### Fonts (Google Fonts CDN)
- **Inter** — UI text, headings
- **JetBrains Mono** — clause quote blocks

---

## 🚀 Running Locally

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/lexai.git
cd lexai
```

### 2. Set up environment

```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY (optional for mock mode)
```

### 3. Start the backend

```bash
npm install
npm run dev        # runs on http://localhost:3001
```

### 4. Start the frontend

```bash
cd client
npm install
npm run dev        # runs on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 🌍 Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Express server port |
| `MAX_FILE_SIZE_MB` | `10` | Max PDF upload size |
| `ANTHROPIC_API_KEY` | *(empty)* | Claude API key for real AI analysis |

---

## 📡 API Reference

### `POST /api/upload`
Upload a PDF contract for text extraction.

- **Body:** `multipart/form-data` with field `contract` (PDF file)
- **Returns:**
```json
{
  "id": "uuid",
  "filename": "stored-filename.pdf",
  "char_count": 4821,
  "preview": "First 300 characters of extracted text..."
}
```

### `POST /api/analyze/:id`
Run analysis on an uploaded contract.

- **Returns:**
```json
{
  "summary": "...",
  "risk_level": "high",
  "risk_clauses": [{ "clause": "...", "risk": "indemnif", "severity": "high" }],
  "missing_protections": ["Dispute resolution clause", "..."],
  "recommended_actions": ["Have a lawyer review before signing", "..."],
  "language": "English"
}
```

### `GET /api/analyze/:id`
Poll for analysis status or retrieve a cached result.

---

## 🎨 Design System

```
Background:     #0A0A0F
Surface:        #111118
Surface hover:  #1A1A24
Accent:         #6366F1  (indigo)
Accent hover:   #818CF8
Text primary:   #F1F5F9
Text muted:     #94A3B8
Border:         #1E1E2E
Risk high:      #EF4444
Risk medium:    #F59E0B
Risk low:       #22C55E
```

---

## 🔮 Roadmap

- [ ] Activate Anthropic Claude integration for real AI analysis
- [ ] Switch SQLite → PostgreSQL for production persistence
- [ ] User authentication + analysis history
- [ ] Export analysis as PDF report
- [ ] Multi-language UI support

---

## 🏢 Built by

**NoirBytes** — *Intelligent tools with sharp edges.*

---

## 📄 License

MIT
