import puppeteer from "puppeteer";

export default async function scrapeGarnstudioPuppeteer(url) {
  console.log(`[Scraper] Launching Puppeteer for: ${url}`);
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

  // Accept cookies if present
  try {
    const cookieBtn = await page.$("#cookie_agree_gdpr_all");
    if (cookieBtn) {
      await cookieBtn.click();
      await page.waitForTimeout(500);
      console.log("[Scraper] Cookie banner accepted");
    }
  } catch {
    console.log("[Scraper] No cookie banner or failed to click");
  }

  const data = await page.evaluate(() => {
    const getText = (selector) =>
      document.querySelector(selector)?.innerText.trim() || "";

    const title = getText("h1") || "Untitled Pattern";

    // Yarn + hook size
    let yarn = "Not specified";
    let hookSize = "Not specified";

    document.querySelectorAll(".pattern-materials, .pattern-main").forEach((el) => {
      const text = el.innerText;
      const yarnMatch = text.match(/Yarn used\s*:?(.+)/i);
      const hookMatch = text.match(/Hook size\s*:?(.+)/i);
      if (yarnMatch) yarn = yarnMatch[1].trim();
      if (hookMatch) hookSize = hookMatch[1].trim();
    });

    // Remove socials/newsletters/etc.
    [
      ".pattern-socialmedia",
      ".socialmedia",
      ".pattern-tools",
      ".share",
      ".newsletter",
      "a[href*='facebook.com']",
      "a[href*='pinterest.com']",
      "a[href*='instagram.com']",
      "a[href*='newsletter']",
      ".addthis_toolbox",
      ".addthis_inline_share_toolbox",
    ].forEach((sel) => {
      document.querySelectorAll(sel).forEach((n) => n.remove());
    });

    // Pattern text
    const patternText = getText("#pattern_text") || getText(".pattern-main");

    return { title, yarn, hookSize, patternText };
  });

  await browser.close();

  // Build the final pretty output
  const formatted = `📌 Pattern: ${data.title}
🔗 Source: ${url}
🧵 Yarn Used: ${data.yarn}
🪝 Hook Size: ${data.hookSize}

━━━━━━━━━━━━━━━━━━━━━━
📜 Instructions
━━━━━━━━━━━━━━━━━━━━━━
${data.patternText}`;

  return {
    success: true,
    formatted,
    data: {
      title: data.title,
      yarn: data.yarn,
      hookSize: data.hookSize,
      instructions: data.patternText,
      sourceUrl: url,
    },
  };
}
