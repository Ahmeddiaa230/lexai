require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const uploadRouter = require('./routes/upload');
const analyzeRouter = require('./routes/analyze');

// Read between the lines - LexAI Core Server
// Built by NoirBytes

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Security Headers via Helmet
app.use(helmet());

// 2. Cross-Origin Resource Sharing
// In production, set FRONTEND_URL env variable to your Vercel domain
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173', 'http://localhost:4173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || !process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Rate Limiting to prevent brute-force and DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 mins
  standardHeaders: true, 
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api', limiter);

// 4. Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome / Status Route
app.get('/', (req, res) => {
  res.json({
    product: 'LexAI',
    tagline: 'Read between the lines.',
    built_by: 'NoirBytes',
    status: 'online'
  });
});

// 5. Mount API Routes
app.use('/api/upload', uploadRouter);
app.use('/api/analyze', analyzeRouter);

// 6. 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Requested endpoint not found.' });
});

// 7. Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[NoirBytes Error Handler]:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'An unexpected server error occurred.'
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`[NoirBytes] LexAI server running at http://localhost:${PORT}`);
  console.log(`[NoirBytes] Tagline: "Read between the lines."`);
});

module.exports = app;
