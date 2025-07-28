// index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import DefuzzedPattern from './models/DefuzzedPattern.js';
import patternRoutes from './routes/patternRoutes.js';




console.log('Model loaded:', DefuzzedPattern.modelName);

// 1. Load .env variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/patterns', patternRoutes);

// 2. Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// index.js (excerpt)

// 3. Health-check route
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// 4. Mock scrape endpoint (to be replaced with real scraper logic)
app.post('/api/scrape', (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'Missing URL' });
  }

  // TODO: call your scraper module here
  // For now, return a placeholder shape:
  return res.json({
    title: '🔨 Scraper MVP Placeholder',
    source: url,
    yarn: 'N/A',
    hookSize: 'N/A',
    formatted: 'This is a mock response—replace with real scraper output.'
  });
});

// 5. Start server (already in place)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
