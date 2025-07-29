import axios from 'axios';
import { load } from 'cheerio';

export default scrapeGarnstudio;
async function scrapeGarnstudio(url) {
  try {
    const { data: html } = await axios.get(url);
    const $ = load(html);

    // Get full pattern content
    let raw = $('#pattern_text').html() || '';
    raw = raw
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '') // remove all other tags
      .replace(/\n{2,}/g, '\n\n') // compress blank lines
      .trim();

    // Title from <title> tag
    const pageTitle = $('title').text().trim().replace(/\s\|.*$/, '') || 'Untitled Project';

    // Yarn and hook size - try a few phrase options
    const yarnMatch = raw.match(/(?:with|using)\s+([^,\.]+)/i);
    let yarn = yarnMatch ? yarnMatch[1].trim() : 'Not specified';
    yarn = yarn.replace(/[.,\s]*$/g, '');
    const hookMatch = raw.match(/hook size[:]? (\d+(?:\.\d+)? ?mm)/i);

    
    const hookSize = hookMatch ? hookMatch[1].trim() : 'Not specified';

    // Pattern vs assembly split
    let patternInstructions = '';
    let assemblyInstructions = '';

    const startSplit = raw.split(/START THE PIECE HERE:/i);
    if (startSplit.length > 1) {
      patternInstructions = startSplit[1].split(/(?:ASSEMBLY|TWISTED CORD|CROCHET EDGE):/i)[0].trim();
      assemblyInstructions = raw.split(/(?:ASSEMBLY|TWISTED CORD|CROCHET EDGE):/i).slice(1).join('\n\n').trim();
    } else {
      patternInstructions = raw;
      assemblyInstructions = 'Not found';
    }

    return {
      title: pageTitle,
      source: url,
      yarn,
      hookSize,
      patternSteps: patternInstructions || 'Not found',
      assembly: assemblyInstructions || 'Not found',
    };
  } catch (err) {
    console.error('❌ Garnstudio scrape failed:', err.message);
    throw new Error('Failed to scrape Garnstudio page');
  }
}
