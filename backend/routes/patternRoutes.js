// backend/routes/patternRoutes.js
import express from 'express';
import { scrapeGarnstudioPuppeteer } from '../scrapers/scrapeGarnstudioPuppeteer.js';
import scrapeZamiguz from '../scrapers/scrapeZamiguz.js';
import scrapeAllFree from '../scrapers/scrapeAllFreeCrochet.js';
import { formatPatternOutput } from '../utils/formatPatternOutput.js';
import DefuzzedPattern from '../models/DefuzzedPattern.js';

const router = express.Router();

router.post('/scrape', async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing URL' });
  }

  try {
    let rawData;

    if (url.includes('garnstudio.com')) {
      const result = await scrapeGarnstudioPuppeteer(url);
      if (!result) {
        return res.status(400).json({ error: 'Pattern is knitting or could not be parsed.' });
      }
      rawData = result;
    } else if (url.includes('zamiguz.com')) {
      rawData = await scrapeZamiguz(url);
    } else if (url.includes('allfreecrochet.com')) {
      rawData = await scrapeAllFree(url);
    } else {
      return res.status(400).json({ error: 'Unsupported URL' });
    }

    const {
      title,
      source,
      yarn,
      hookSize,
      instructions,
      assembly = '',
      categorized,
      patternNumber,
      gauge,
      sizes,
      difficulty,
      yarnRequirements,
      images,
      languages,
      relatedPatterns,
      language,
      scrapedAt = new Date(),
    } = rawData;

    const formatted = formatPatternOutput({
      title,
      source,
      yarn,
      hookSize,
      patternSteps: instructions,
      assembly,
    });

    const structured = {
      title,
      source,
      yarn,
      hook: hookSize,
      language,
      instructions,
      assembly,
      patternNumber,
      gauge,
      sizes,
      difficulty,
      yarnRequirements,
      images,
      languages,
      relatedPatterns,
      categorized,
      scrapedAt,
    };

    // Optional: save to DB later
    // await DefuzzedPattern.create({ ...structured, formatted });

    return res.json({
      success: true,
      data: {
        structured,
        formatted,
      },
    });
  } catch (err) {
    console.error('❌ Scrape error:', err);
    return res.status(500).json({ error: 'Failed to scrape pattern', details: err.message });
  }
});

export default router;
