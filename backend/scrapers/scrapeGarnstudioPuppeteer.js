import puppeteer from 'puppeteer';

/**
 * Scrapes crochet pattern data from a Garnstudio URL.
 * @param {string} url - The Garnstudio pattern URL to scrape.
 * @returns {Promise<Object>} An object containing scraped pattern details.
 */
export async function scrapeGarnstudioPuppeteer(url) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const result = await page.evaluate(() => {
    const title = document.querySelector('h1.pattern-headline')?.innerText.trim() || 'Untitled';
    const language = document.querySelector('.active-language')?.innerText?.trim() || 'Unknown';
    const dateScraped = new Date().toISOString();

    const yarn =
      document.querySelector('.pattern-facts .yarn-group')?.innerText.trim() || 'Not specified';

    const hook =
      document.querySelector('.pattern-facts .needle-size')?.innerText.trim() || 'Not specified';

    const patternBlock = document.querySelector(
      '#site_wrapper > div.row.content.hiddenprint > div > div:nth-child(1) > div.col-12.col-sm-12.col-md-7.pattern-main > div:nth-child(3)'
    );
    const instructions = patternBlock?.innerText.trim() || '';

    const isKnitting =
      instructions.toLowerCase().includes('knit') ||
      instructions.toLowerCase().includes('stockinette');

    // Stub images
    const images = Array.from(document.querySelectorAll('.pattern-img img')).map((img) => ({
      url: img.src,
      alt: img.alt || '',
    }));

    // Language links
    const languages = Array.from(document.querySelectorAll('#language-selector a')).map((a) => ({
      language: a.innerText.trim(),
      url: a.href,
    }));

    return {
      title,
      language,
      yarn,
      hook,
      gauge: 'Not specified',
      sizes: 'Not specified',
      difficulty: 'Not specified',
      instructions,
      categorized: {
        setup: [],
        mainInstructions: instructions
          ? instructions.split('\n').filter((line) => line.trim().length > 0)
          : [],
        assembly: [],
        notes: [],
        abbreviations: [],
      },
      images,
      relatedPatterns: [],
      languages,
      source: window.location.href,
      scrapedAt: dateScraped,
      isKnitting,
    };
  });

  await browser.close();

  if (result.isKnitting) {
    return null;
  }

  const { isKnitting, ...finalResult } = result;
  return finalResult;
}
