import formatPatternOutput from '../utils/formatPatternOutput.js';
import garnstudioScraper from '../scrapers/scrapeGarnstudioPuppeteer.js';
// Add more scraper imports as needed

const getScraperForUrl = (url) => {
  if (url.includes('garnstudio.com')) return garnstudioScraper;
  // Add more domains as you build new scrapers
  return null;
};

const scrapeSingle = async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, message: "No URL provided." });

  const scraper = getScraperForUrl(url);
  if (!scraper) return res.status(400).json({ success: false, message: "No scraper for this URL." });

  try {
    const rawPattern = await scraper(url);
    const formatted = formatPatternOutput(rawPattern, url);

    res.json({
      success: true,
      data: {
        ...rawPattern,
        sourceUrl: url,
        formatted, // this is the copy-ready, cleaned output
      },
    });
  } catch (err) {
    console.error("Scrape error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to scrape pattern." });
  }
};

export default {
  scrapeSingle,
};
