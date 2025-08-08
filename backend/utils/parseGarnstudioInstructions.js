export default function parseGarnstudioInstructions(rawText = '') {
  const sections = {
    gauge: [],
    tips: [],
    rowStartConversions: [],
    increases: [],
    decreases: [],
    backPiece: '',
    frontPiece: '',
    assembly: ''
  };

  if (!rawText || typeof rawText !== 'string') return sections;

  const lines = rawText
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  let current = '';
  const buffer = {
    backPiece: [],
    frontPiece: [],
    assembly: [],
    tips: [],
  };

  for (let line of lines) {
    const lower = line.toLowerCase();

    // --- Robust section heading detection ---
    if (/^back\s*piece\s*[:\-]?$/i.test(line)) {
      current = 'backPiece';
      continue;
    }
    if (/^front\s*piece\s*[:\-]?$/i.test(line)) {
      current = 'frontPiece';
      continue;
    }
    if (/^(assembly\s*instructions?|finishing)\s*[:\-]?$/i.test(line)) {
      current = 'assembly';
      continue;
    }

    // --- Smart guessing when heading is missing ---
    if (
      !current &&
      /turn and work|continue.*shoulder|work until armhole|begin with chain/i.test(lower)
    ) {
      current = 'backPiece';
    } else if (
      !current &&
      /begin the same way|repeat for opposite|make 2 alike/i.test(lower)
    ) {
      current = 'frontPiece';
    } else if (
      !current &&
      /sew|join with|fasten off|weave in ends|block the piece/i.test(lower)
    ) {
      current = 'assembly';
    }

    // --- Add line to appropriate buffer ---
    if (['backPiece', 'frontPiece', 'assembly'].includes(current)) {
      buffer[current].push(line);
    } else {
      // Avoid adding garbage like size charts or yarn codes to tips
      if (!/^\d+\s*g\b/i.test(line) && !/^size\b/i.test(lower)) {
        buffer.tips.push(line);
      }
    }
  }

  // --- Assign cleaned results ---
  sections.backPiece = buffer.backPiece.join('\n').trim();
  sections.frontPiece = buffer.frontPiece.join('\n').trim();
  sections.assembly = buffer.assembly.join('\n').trim();

  // Deduplicate & clean tips
  sections.tips = [...new Set(buffer.tips.map(t => t.trim()))].filter(Boolean);

  return sections;
}
