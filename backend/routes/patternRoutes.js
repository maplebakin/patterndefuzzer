// backend/routes/patternRoutes.js
import express from 'express';
import scrapeGarnstudio from '../scrapers/scrapeGarnstudio.js';
import scrapeZamiguz from '../scrapers/scrapeZamiguz.js';
import scrapeAllFree from '../scrapers/scrapeAllFreeCrochet.js';

import { formatPatternOutput } from '../utils/formatPatternOutput.js';

const router = express.Router();

router.post('/scrape', async (req, res) => {
  const { url } = req.body;

  try {
    let rawData;
    if (url.includes('garnstudio.com')) {
      rawData = await scrapeGarnstudio(url);
    } else if (url.includes('zamiguz.com')) {
      rawData = await scrapeZamiguz(url);
    } else if (url.includes('allfreecrochet.com')) {
      rawData = await scrapeAllFree(url);
    } else {
      return res.status(400).json({ error: 'Unsupported URL' });
    }

const cleaned = formatPatternOutput(rawData);
    res.json({ success: true, data: cleaned });
  } catch (err) {
    console.error('❌ Scrape error:', err);
    res.status(500).json({ error: 'Failed to scrape pattern' });
  }
});

export default router;
