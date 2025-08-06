import express from 'express';
import { scrapeGarnstudio } from './backend/scrapers/scrapeGarnstudio.js';
import { scrapeAllFreeCrochet } from './backend/scrapers/scrapeAllFreeCrochet.js';
import { scrapeZamiguz } from './scrapeZamiguz.js';

const router = express.Router();

router.post('/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    let data;

    if (url.includes('garnstudio.com')) {
      data = await scrapeGarnstudio(url);
    } else if (url.includes('allfreecrochet.com')) {
      data = await scrapeAllFreeCrochet(url);
    } else if (url.includes('zamiguz.com')) {
      data = await scrapeZamiguz(url);
    } else {
      return res.status(400).json({ error: 'Unsupported site for now' });
    }

    res.json(data);
  } catch (err) {
    console.error('Scrape failed:', err.message);
    res.status(500).json({ error: 'Failed to scrape page' });
  }
});

export default router;
