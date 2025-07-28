import axios from 'axios';
import * as cheerio from 'cheerio';

export default scrapeAllFreeCrochet;
async function scrapeAllFreeCrochet(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const title = $('h1').first().text().trim();
  const source = url;

  // Try to find external pattern link (very common)
  const externalLink = $('a.linkOut')
    .filter((i, el) =>
      $(el).text().toLowerCase().includes('click here')
    )
    .attr('href');

  if (externalLink) {
    return {
      title,
      source,
      yarn: 'See external site',
      hookSize: 'See external site',
      patternSteps: `Redirected to: ${externalLink}`,
      assembly: 'See external site or not provided',
      note: 'This pattern lives on an external site. Try scraping that link instead!'
    };
  }

  // Fallback if full pattern is embedded (rare)
  const patternSteps = $('.article-body p, .article-body li')
    .map((i, el) => $(el).text().trim())
    .get()
    .filter(line => line.length > 0)
    .join('\n\n');

  return {
    title,
    source,
    yarn: 'Not specified',
    hookSize: 'Not specified',
    patternSteps: patternSteps || 'No steps found, and no external link was detected.',
    assembly: 'Not specified'
  };
}
