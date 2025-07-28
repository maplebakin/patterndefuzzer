import axios from 'axios';
import { load } from 'cheerio';

export async function scrapeGarnstudio(url) {
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
    const yarnMatch = raw.match(/(?:with|using)\s+(.*?)\s+(?:and|to work|for the)/i);
    const hookMatch = raw.match(/hook size[:]? (\d+(?:\.\d+)? ?mm)/i);

    const yarn = yarnMatch ? yarnMatch[1].trim() : 'Not specified';
    const hookSize = hookMatch ? hookMatch[1].trim() : 'Not specified';

    // Pattern vs assembly split
    let patternInstructions = '';
    let assemblyInstructions = '';

    // Find "START THE PIECE HERE" to isolate pattern
    const startSplit = raw.split(/START THE PIECE HERE:/i);
    if (startSplit.length > 1) {
      patternInstructions = startSplit[1].split(/(?:ASSEMBLY|TWISTED CORD|CROCHET EDGE):/i)[0].trim();
      assemblyInstructions = raw.split(/(?:ASSEMBLY|TWISTED CORD|CROCHET EDGE):/i).slice(1).join('\n\n').trim();
    } else {
      // fallback if split fails
      patternInstructions = raw;
    }

    return {
      title: pageTitle,
      source: url,
      yarn,
      hookSize,
      formatted: `Title: ${pageTitle}\nSource: ${url}\nYarn: ${yarn}\nHook Size: ${hookSize}\n\n🧶 Pattern Instructions\n${patternInstructions}\n\n🪡 Assembly Instructions\n${assemblyInstructions}`
    };
  } catch (err) {
    console.error('❌ Garnstudio scrape failed:', err.message);
    return { error: 'Failed to scrape Garnstudio page' };
  }
}
