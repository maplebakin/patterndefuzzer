// backend/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import patternRoutes from './routes/patternRoutes.js';

dotenv.config();

const app = express();

/* ───────────── App Settings ───────────── */
app.set('trust proxy', 1); // safe if you ever sit behind a proxy (render/vercel/nginx)

/* ───────────── Middleware ───────────── */
app.use(cors()); // if you need to lock this down later, we’ll add an origin allowlist
app.use(express.json({ limit: '1mb' })); // small, safe payloads for URLs and config

/* ───────────── Simple Cache Scaffold ─────────────
   Use app.locals.cache to cache scrape results by sourceURL.
   Later we can swap this for Redis without changing route code.
*/
app.locals.cache = new Map();
/**
 * Save a value with TTL (ms)
 * @param {string} key
 * @param {any} value
 * @param {number} ttlMs
 */
app.locals.cacheSet = (key, value, ttlMs = 1000 * 60 * 60) => {
  const expires = Date.now() + ttlMs;
  app.locals.cache.set(key, { value, expires });
};
/**
 * Get a cached value, or null if expired/missing
 * @param {string} key
 * @returns {any|null}
 */
app.locals.cacheGet = (key) => {
  const hit = app.locals.cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expires) {
    app.locals.cache.delete(key);
    return null;
  }
  return hit.value;
};

/* ───────────── Routes ───────────── */
app.use('/api/patterns', patternRoutes);

// Health-check route
app.get('/api/health', (_req, res) => res.json({ status: 'OK' }));

/* ───────────── 404 + Error Handling ───────────── */
app.use((req, res, _next) => {
  res.status(404).json({ success: false, message: `Not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

/* ───────────── Start ───────────── */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
