import axios from 'axios';
import * as cheerio from 'cheerio';


const scrapeGarnstudio = async (url) => {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(data);
    
    // Basic pattern info
    const title = $('.pattern-heading, .pattern-title, h1').first().text().trim() || 'Untitled Pattern';
    const patternNumber = $('.pattern-number, .pattern-id').text().trim() || url.match(/(\d+)$/)?.[1] || 'Unknown';
    
    // Enhanced facts parsing
    const factsText = $('.pattern-facts, .pattern-info, .pattern-details').text();
    const yarnMatch = factsText.match(/Yarn group:\s*([A-Z])/i);
    const hookMatch = factsText.match(/(?:Needle|Hook) size:\s*([\d.]+ ?(?:mm|US \d+))/i);
    const gaugeMatch = factsText.match(/Gauge:\s*([^\n]+)/i);
    const sizeMatch = factsText.match(/Size(?:s)?:\s*([^\n]+)/i);
    const difficultyMatch = factsText.match(/(?:Level|Difficulty):\s*([^\n]+)/i);
    
    // Extract yarn requirements
    const yarnRequirements = [];
    $('.yarn-table tr, .materials-table tr, .yarn-info').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.includes('g') && text.includes('balls')) {
        yarnRequirements.push(text);
      }
    });
    
    // Get pattern metadata
    const metadata = {
      title,
      patternNumber,
      yarn: yarnMatch ? `Group ${yarnMatch[1]}` : 'Not specified',
      hook: hookMatch ? hookMatch[1] : 'Not specified',
      gauge: gaugeMatch ? gaugeMatch[1].trim() : 'Not specified',
      sizes: sizeMatch ? sizeMatch[1].trim() : 'Not specified',
      difficulty: difficultyMatch ? difficultyMatch[1].trim() : 'Not specified',
      yarnRequirements: yarnRequirements.length > 0 ? yarnRequirements : ['Not specified'],
    };
    
    // Enhanced instruction extraction
    const instructions = [];
    const structuredSections = {};
    
    // Look for structured sections
    $('.pattern-content section, .pattern-content div[class*="section"]').each((i, section) => {
      const sectionTitle = $(section).find('h2, h3, h4, .section-title').first().text().trim();
      const sectionContent = [];
      
      $(section).find('p, li').each((j, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 0) sectionContent.push(text);
      });
      
      if (sectionTitle && sectionContent.length > 0) {
        structuredSections[sectionTitle] = sectionContent;
      }
    });
    
    // Fallback to all content if no structured sections found
    if (Object.keys(structuredSections).length === 0) {
      $('.pattern-content p, .pattern-content li, .instructions p, .instructions li').each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 0) instructions.push(text);
      });
    }
    
    // Enhanced categorization
    const categorizeInstructions = (allInstructions) => {
      const categories = {
        abbreviations: [],
        materials: [],
        setup: [],
        mainInstructions: [],
        assembly: [],
        finishing: [],
        notes: []
      };
      
      allInstructions.forEach(instruction => {
        const lowerInstruction = instruction.toLowerCase();
        
        if (/abbreviation|abbrev|legend|stitch guide/i.test(instruction)) {
          categories.abbreviations.push(instruction);
        } else if (/material|yarn|needle|hook|notions/i.test(instruction)) {
          categories.materials.push(instruction);
        } else if (/cast on|chain|foundation|setup|begin/i.test(instruction)) {
          categories.setup.push(instruction);
        } else if (/assembly|finishing|sew|join|fasten off|bind off|weave|block/i.test(instruction)) {
          categories.assembly.push(instruction);
        } else if (/note:|tip:|important:|remember/i.test(instruction)) {
          categories.notes.push(instruction);
        } else {
          categories.mainInstructions.push(instruction);
        }
      });
      
      return categories;
    };
    
    // Extract images
    const images = [];
    $('.pattern-image img, .gallery img, .main-image img').each((i, img) => {
      const src = $(img).attr('src');
      const alt = $(img).attr('alt');
      if (src) {
        images.push({
          url: src.startsWith('http') ? src : `https://www.garnstudio.com${src}`,
          alt: alt || `Pattern image ${i + 1}`
        });
      }
    });
    
    // Extract related patterns or suggestions
    const relatedPatterns = [];
    $('.related-pattern, .suggestion, .similar-pattern').each((i, el) => {
      const link = $(el).find('a').attr('href');
      const title = $(el).find('a').text().trim() || $(el).text().trim();
      if (link && title) {
        relatedPatterns.push({
          title,
          url: link.startsWith('http') ? link : `https://www.garnstudio.com${link}`
        });
      }
    });
    
    // Process instructions
    const allInstructions = Object.keys(structuredSections).length > 0 
      ? Object.values(structuredSections).flat() 
      : instructions;
    
    const categorized = categorizeInstructions(allInstructions);
    
    // Extract language variants if available
    const languages = [];
    $('.language-selector a, .lang-switch a').each((i, el) => {
      const lang = $(el).text().trim();
      const href = $(el).attr('href');
      if (lang && href) {
        languages.push({
          language: lang,
          url: href.startsWith('http') ? href : `https://www.garnstudio.com${href}`
        });
      }
    });
    
    return {
      // Basic info
      ...metadata,
      
      // Structured content
      structuredSections: Object.keys(structuredSections).length > 0 ? structuredSections : null,
      instructions: allInstructions.join('\n'),
      categorized,
      
      // Media and related content
      images,
      relatedPatterns,
      languages,
      
      // Meta
      source: url,
      scrapedAt: new Date().toISOString(),
      totalInstructions: allInstructions.length
    };
    
  } catch (error) {
    console.error('❌ Garnstudio scraping failed:', error.message);
    
    // More detailed error handling
    if (error.code === 'ECONNABORTED') {
      return { error: 'Request timed out. The pattern may be too large or the server is slow.' };
    } else if (error.response?.status === 404) {
      return { error: 'Pattern not found. Please check the URL.' };
    } else if (error.response?.status === 403) {
      return { error: 'Access denied. The pattern may be restricted.' };
    } else if (error.response?.status >= 500) {
      return { error: 'Server error. Please try again later.' };
    }
    
    return { 
      error: 'Failed to scrape pattern. Please check the URL or try again later.',
      details: error.message
    };
  }
};

// Helper function to scrape multiple patterns
export const scrapeMultiplePatterns = async (urls, delay = 1000) => {
  const results = [];
  
  for (const url of urls) {
    console.log(`Scraping: ${url}`);
    const result = await scrapeGarnstudio(url);
    results.push(result);
    
    // Be respectful with delays
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
};

export default scrapeGarnstudio;