// backend/controllers/patternController.js

const DefuzzedPattern = require('../models/DefuzzedPattern');
const formatPatternOutput = require('../utils/formatPatternOutput');
const garnstudioScraper = require('../scrapers/garnstudioScraper');
// Add other scrapers as you build them, e.g.:
// const yarnspirationsScraper = require('../scrapers/yarnspirationsScraper');

const getScraperForUrl = (url) => {
  if (url.includes('garnstudio.com')) return garnstudioScraper;
  // if (url.includes('yarnspirations.com')) return yarnspirationsScraper;
  // Add more conditions as needed
  return null;
};

exports.scrapeSingle = async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, message: "No URL provided." });

  const scraper = getScraperForUrl(url);
  if (!scraper) return res.status(400).json({ success: false, message: "No scraper available for this URL." });

  try {
    // 1. Scrape
    const rawPattern = await scraper(url);

    // 2. Format
    const formatted = formatPatternOutput(rawPattern, url);

    // 3. Save to DB
    const saved = await DefuzzedPattern.create(formatted);

    res.json({ success: true, data: saved });
  } catch (err) {
    console.error("Scrape error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to scrape pattern." });
  }
};

exports.getAllPatterns = async (req, res) => {
  try {
    const patterns = await DefuzzedPattern.find().sort({ createdAt: -1 });
    res.json({ success: true, data: patterns });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch patterns." });
  }
};

exports.getPatternById = async (req, res) => {
  try {
    const pattern = await DefuzzedPattern.findById(req.params.id);
    if (!pattern) return res.status(404).json({ success: false, message: "Pattern not found." });
    res.json({ success: true, data: pattern });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch pattern." });
  }
};

// (Optional: deletePattern, scrapeBatch, etc.)
