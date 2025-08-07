export function formatPatternOutput({
  title = 'Untitled Pattern',
  source = 'Not specified',
  yarn = 'Not specified',
  hookSize = 'Not specified',
  gauge = [],
  hookAndYarnInfo = [],
  tips = [],
  rowStartConversions = [],
  increases = [],
  decreases = [],
  backSteps = [],
  frontSteps = [],
  assemblySteps = [],
  backPiece = '',
  frontPiece = '',
  assembly = '',
}) {
  const sectionList = (title, array) => {
    if (!Array.isArray(array) || array.length === 0) return '';
    return `### ${title}\n\n${array.map((line) => `- ${line}`).join('\n')}`;
  };

  const sectionText = (title, text) => {
    return text?.trim()
      ? `### ${title}\n\n${text
          .split(/(?<=[.?!])\s+(?=[A-Z*])/)
          .map((s) => s.trim())
          .join('\n\n')}`
      : '';
  };

  const stepsList = (title, steps, fallbackText) => {
    if (steps?.length > 0) {
      return `### ${title}\n\n${steps.map((step) => `- ${step}`).join('\n')}`;
    } else if (fallbackText?.trim()) {
      return `### ${title}\n\n${fallbackText
        .split(/(?<=[.?!])\s+(?=[A-Z*])/)
        .map((s) => `- ${s.trim()}`)
        .join('\n')}`;
    } else {
      return `### ${title}\n\nNot specified.`;
    }
  };

  // Clean up tips into subcategories
  const gaugeTips = tips.filter(t => /10\s*x\s*10\s*cm/i.test(t));
  const hookTips = tips.filter(t =>
    /hook size|hook the chain|chain stitch.*wide/i.test(t)
  );
  const diagramTips = tips.filter(t => /see diagrams?/i.test(t));
  const startConversions = tips.filter(t =>
    /beginning of.*row.*(double|half|treble)/i.test(t)
  );
  const increaseTips = tips.filter(t => /increase.*?stitch/i.test(t));
  const decreaseTips = tips.filter(t =>
    /decrease|slip stitch|pull yarn through.*loops/i.test(t)
  );

  const tipsSection = [
    sectionList('🧾 Gauge', gaugeTips),
    sectionList('🪝 Hook & Chain Notes', hookTips),
    sectionList('📊 Diagrams', diagramTips),
    sectionList('🔁 Row Start Conversions', startConversions),
    sectionList('➕ Increases', increaseTips),
    sectionList('➖ Decreases', decreaseTips)
  ]
    .filter(Boolean)
    .join('\n\n');

  return `📌 Pattern: ${title}  
🔗 Source: ${source}  
🧵 Yarn Used: ${yarn}  
🪝 Hook Size: ${hookSize}  

━━━━━━━━━━━━━━━━━━━━━━  
🧶 Pattern Instructions  
━━━━━━━━━━━━━━━━━━━━━━  

${tipsSection}

---

${stepsList('🔹 BACK PIECE:', backSteps, backPiece)}

---

${stepsList('🔹 FRONT PIECE:', frontSteps, frontPiece)}

---

${stepsList('🪡 Assembly Instructions', assemblySteps, assembly)}

━━━━━━━━━━━━━━━━━━━━━━`;
}

export default formatPatternOutput;
