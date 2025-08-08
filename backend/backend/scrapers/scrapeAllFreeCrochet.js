import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function scrapeAllFreeCrochet(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const title = $('h1').first().text().trim() || 'Untitled Pattern';
  const source = url;

  // External-link check (common on AllFreeCrochet)
  const externalLink = $('a.linkOut')
    .filter((i, el) => $(el).text().toLowerCase().includes('click here'))
    .attr('href');

  if (externalLink) {
    return {
      title,
      source,
      yarn: 'See external site',
      hookSize: 'See external site',
      patternSteps: `Redirected to: ${externalLink}`,
      assembly: 'See external site or not provided',
      note: 'Pattern lives on an external page—try scraping that link.',
    };
  }

  // ——— NEW: scrape instructions from structured <div class="sections"> layout ———
  const sections = [];

  $('div.sections > div.section').each((_, sec) => {
    const header = $(sec).find('h4').first().text().trim();

    // ❌ Skip non-pattern fluff sections
    if (/pdf|download|how to print/i.test(header)) return;

    const lines = [];

    // ✅ Grab <p> and <li><p> under the section
    $(sec)
      .find('.articleAttrSection p, ol.cells li.decimal p')
      .each((_, el) => {
        const txt = $(el).text().trim();
        if (
          txt &&
          !txt.toLowerCase().includes('click here') &&
          !/^https?:\/\//.test(txt)
        ) {
          lines.push(txt);
        }
      });

    if (lines.length) {
      sections.push([header, ...lines].join('\n'));
    }
  });

  const patternSteps = sections.length
    ? sections.join('\n\n')
    : 'No steps found in expected layout.';

  return {
    title,
    source,
    yarn: 'Not specified',
    hookSize: 'Not specified',
    patternSteps,
    assembly: 'Not specified',
  };
}
