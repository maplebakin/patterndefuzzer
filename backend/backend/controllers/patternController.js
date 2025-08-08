import scrapeGarnstudioPuppeteer from "../scrapers/scrapeGarnstudioPuppeteer.js";

export const scrapeSingle = async (req, res) => {
  try {
    const { url } = req.body;
    console.log("[Controller] scrapeSingle called with body:", req.body);

    if (!url || !/^https?:\/\//.test(url)) {
      return res.status(400).json({
        success: false,
        message: "Valid URL required.",
      });
    }

    console.log("[Controller] Starting scrape for:", url);

    // Scrape the pattern
    const result = await scrapeGarnstudioPuppeteer(url);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Scraping failed.",
      });
    }

    const { title, yarn, hookSize, summary, instructions } = result.data;

    // Build the formatted output
    let formatted = "";
    formatted += `📌 Pattern: ${title || "Unknown Title"}\n`;
    formatted += `🔗 Source: ${url}\n`;
    formatted += `🧵 Yarn Used: ${yarn || "Not specified"}\n`;
    formatted += `🪝 Hook Size: ${hookSize || "Not specified"}\n\n`;

    if (summary) {
      formatted += "━━━━━━━━━━━━━━━━━━━━━━\n";
      formatted += "🧶 Pattern Summary\n";
      formatted += "━━━━━━━━━━━━━━━━━━━━━━\n";
      formatted += `${summary.trim()}\n\n`;
    }

    if (instructions) {
      formatted += "━━━━━━━━━━━━━━━━━━━━━━\n";
      formatted += "📜 Instructions\n";
      formatted += "━━━━━━━━━━━━━━━━━━━━━━\n";
      formatted += `${instructions.trim()}`;
    }

    console.log("[Controller] Scrape completed, result keys:", Object.keys(result));

    return res.json({
      success: true,
      data: {
        formatted,
        sourceUrl: url,
      },
    });
  } catch (err) {
    console.error("[Controller] scrapeSingle error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Unknown error occurred.",
    });
  }
};

// Default export so routes can still use `patternController.scrapeSingle`
export default {
  scrapeSingle,
};
