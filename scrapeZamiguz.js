import * as cheerio from 'cheerio';
import axios from 'axios';
import { formatPatternOutput } from './formatPatternOutput.js';

export async function scrapeZamiguz(url) {
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);

  const title = $('h1.entry-title').text().trim() || 'Untitled Pattern';
  const source = url;
  const hookSize = $('li:contains("Hook size")').text().replace(/.*?:/, '').trim() || 'Not specified';
  const yarn = $('li:contains("Yarn")').text().replace(/.*?:/, '').trim() || 'Not specified';

  // Extract pattern steps
  const stepSection = $('h2:contains("Pattern Instructions")').nextUntil('h2');
  const steps = stepSection.map((_, el) => $(el).text().trim()).get().filter(Boolean).join('\n');

  // Extract assembly instructions
  const assemblySection = $('h2:contains("Assembly Instructions"), h2:contains("Finishing"), h3:contains("Assembly")')
    .nextUntil('h2, h3, h4')
    .map((_, el) => $(el).text().trim()).get().filter(Boolean).join('\n');

  return {
    formatted: formatPatternOutput({
      title,
      source,
      yarn,
      hookSize,
      patternSteps: steps || 'Not found',
      assembly: assemblySection || 'Not found'
    })
  };
}
