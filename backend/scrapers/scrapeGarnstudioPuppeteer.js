import puppeteer from 'puppeteer';

export async function scrapeGarnstudioPuppeteer(url) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const result = await page.evaluate(() => {
    const title =
      document.querySelector('h1.pattern-headline')?.innerText.trim() ||
      document.querySelector('.pattern-headline')?.innerText.trim() ||
      document.title.split('|')[0].trim() ||
      'Untitled';

    let yarn =
      document.querySelector('.pattern-facts .yarn-group')?.innerText.trim() ||
      Array.from(document.querySelectorAll('.pattern-facts li'))
        .find(li => /yarn/i.test(li.innerText))?.innerText.trim() ||
      'Not specified';

    let hookSize =
      document.querySelector('.pattern-facts .needle-size')?.innerText.trim() ||
      Array.from(document.querySelectorAll('.pattern-facts li'))
        .find(li => /hook/i.test(li.innerText))?.innerText.trim() ||
      'Not specified';

    const language = document.querySelector('.active-language')?.innerText?.trim() || 'Unknown';
    const dateScraped = new Date().toISOString();

    const patternBlock = document.querySelector(
      '#site_wrapper > div.row.content.hiddenprint > div > div:nth-child(1) > div.col-12.col-sm-12.col-md-7.pattern-main > div:nth-child(3)'
    );
    let instructions = patternBlock?.innerText.trim() || '';

    // CLEANUP: filter out non-pattern junk lines and legend explanations
    const excludePatterns = [
      /^Pattern\s*$/, /^Videos/i, /^Lessons/i, /^FAQ/i, /^Comments/i, /^Change language/i,
      /^DROPS design/i, /^#/, /^Yarn group/i, /^Alternative Yarn/i,
      /^You might also like/i, /^Pattern instructions/i, /^Increase\/Decrease Calculator/i,
      /^NOTE:/i, /^EXPLANATION FOR THE PATTERN:/i, /^CROCHET TIP/i,
      /^PATTERN\./i, /^CROCHET INFORMATION/i, /^INCREASE TIP/i, /^DECREASE TIP/i,
      /^START THE PIECE HERE/i, /^TOP - SHORT OVERVIEW OF THE PIECE/i,
      /^ASSEMBLY:/i, /^Diagram/i, /^©/, /^What can you do with our patterns\?/i,
      /^We reserve the right/i, /^The sale of garments/i, /^Further commercial use/i,
      /^The use of clothing labels/i, /^The use of DROPS photos/i, /^Highlight Size:/i,
      /^SIZE:/i, /^MATERIALS:/i, /^CROCHET TENSION:/i, /^CROCHET HOOK:/i,
      /^English \(/i, /^[SMXL ]+$/, /^= /, /^Women Tops/i, /^DROPS \d{3}-\d+/,
      /^Hook size is only a suggestion/i, /^Yarn usage using an alternative yarn/i,
      /^S - M - L - XL - XXL - XXXL/i, /^Not specified\./i, /^DROPS PARIS from Garnstudio/i,
      /^.*\bconvert\b.*$/i, /^.*\bcalculator\b.*$/i, /^.*\bchart\b.*$/i,
      /^.*\boverview\b.*$/i, /^.*\bbottom up\b.*$/i, /^.*\bfasten off\b.*$/i,
      /^.*\bdiagram\b.*$/i,
      /^$/, // remove empty lines
      /^-{2,}$/ // remove lines with just dashes
    ];

    instructions = instructions
      .split('\n')
      .map(line => line.trim())
      .filter(line =>
        line &&
        !excludePatterns.some(pattern => pattern.test(line))
      )
      .join('\n');

    // Try to extract yarn from the instructions if missing
    if (yarn === 'Not specified') {
      const yarnMatch = instructions.match(/^\d[\d\- ]+g colour.*$/im) ||
                        instructions.match(/^.*yarn.*$/im) ||
                        instructions.match(/^DROPS PARIS.*$/im);
      if (yarnMatch) yarn = yarnMatch[0];
    }

    // IMPROVED hook size extraction (now always returns hookSize)
    if (hookSize === 'Not specified') {
      const lines = instructions.split('\n');
      let hookMatch = lines.find(line =>
        /hook/i.test(line) && /\d+(?:\.\d+)?\s?mm/i.test(line)
      );
      if (hookMatch) {
        // Extract "5 mm" (or similar) from the line, or use the whole line as fallback
        const mmMatch = hookMatch.match(/(\d+(?:\.\d+)?)\s?mm/i);
        hookSize = mmMatch ? `Hook size ${mmMatch[1]} mm` : hookMatch.trim();
      }
    }

    // Remove extracted lines from instructions
    instructions = instructions
      .split('\n')
      .filter(line => line !== yarn && line !== hookSize)
      .join('\n');

    // Replace repeated divider lines with one pretty divider
    instructions = instructions.replace(/(-{5,}\n?)+/g, '━━━━━━━━━━━━━━━━━━━━━━\n');

    // Remove trailing legend lines (starting with '=')
    instructions = instructions.replace(/(^= .*\n?)+$/gm, '').trim();

    const isKnitting =
      instructions.toLowerCase().includes('knit') ||
      instructions.toLowerCase().includes('stockinette');

    // Pattern images
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
      hookSize,
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
  return finalResult; // hookSize is now guaranteed!
}

export default scrapeGarnstudioPuppeteer;
