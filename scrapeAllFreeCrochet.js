import axios from 'axios';
import * as cheerio from 'cheerio';
export async function scrapeAllFreeCrochet(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const title = $('h1').first().text().trim();

  // Try to find the pattern link
  const externalLink = $('a.linkOut')
  .filter((i, el) =>
    $(el).text().toLowerCase().includes('click here')
  )
  .attr('href');



  if (externalLink) {
    return {
      title,
      redirect: externalLink,
      note: 'This pattern lives on an external site. Try scraping that link instead!'
    };
  }

  // Fallback in case there's inline pattern (rare)
  const patternSteps = $('.article-body p, .article-body li')
    .map((i, el) => $(el).text().trim())
    .get()
    .filter(line => line.length > 0)
    .join('\n\n');

  return {
    title,
    patternSteps: patternSteps || 'No steps found, and no external link was detected.'
  };
}
