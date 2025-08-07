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

  const lines = rawText.split('\n').map((line) => line.trim());
  let current = '';
  const buffer = {
    backPiece: [],
    frontPiece: [],
    assembly: [],
    tips: [],
  };

  for (let line of lines) {
    const lower = line.toLowerCase();

    if (/^back piece[:]?$/i.test(line)) {
      current = 'backPiece';
      continue;
    } else if (/^front piece[:]?$/i.test(line)) {
      current = 'frontPiece';
      continue;
    } else if (/assembly instructions[:]?$/i.test(line) || /^assembly[:]?$/i.test(line)) {
      current = 'assembly';
      continue;
    }

    // Smart content classification if section label is missing
    if (/^turn and work|^work.*shoulder|^continue to work|^skip.*chain/i.test(lower)) {
      current = 'backPiece';
    } else if (/^begin the same way|^cut and fasten|^repeat for opposite/i.test(lower)) {
      current = 'frontPiece';
    } else if (/^sew|^fasten off|^cut and fasten/i.test(lower)) {
      current = 'assembly';
    }

    // Push to detected buffer
    if (['backPiece', 'frontPiece', 'assembly'].includes(current)) {
      buffer[current].push(line);
    } else {
      buffer.tips.push(line); // fallback if it doesn’t match anything
    }
  }

  // Flatten buffers
  sections.backPiece = buffer.backPiece.join('\n').trim();
  sections.frontPiece = buffer.frontPiece.join('\n').trim();
  sections.assembly = buffer.assembly.join('\n').trim();

  // Tips fallback gets pushed as tips array
  sections.tips = buffer.tips.filter(Boolean);

  return sections;
}
