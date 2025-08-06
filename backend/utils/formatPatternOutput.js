// backend/utils/formatPatternOutput.js

export function formatPatternOutput({
  title = 'Untitled Pattern',
  source = 'Not specified',
  yarn = 'Not specified',
  hookSize = 'Not specified',
  instructions = '',
  patternSteps = '',
  assembly = ''
}) {
  const baseInstructions = instructions || patternSteps || 'No instructions found.';
  const cleanSteps = baseInstructions
    .split('\n')
    .map(line => {
      if (/^Now work pattern as follows:/i.test(line)) {
        return '→ Work repeats/increases until desired width';
      }
      if (/^Then work pattern from row with arrow/i.test(line)) {
        return '→ Continue pattern repeats until desired length';
      }
      if (/^SHAWL\s*[-–]\s*SHORT\s*OVERVIEW/i.test(line)) {
        return 'Overview:';
      }
      return line;
    })
    .join('\n')
    .trim();

  return `📌 Pattern: ${title}
🔗 Source: ${source}
🧵 Yarn Used: ${yarn}
🪝 Hook Size: ${hookSize}

━━━━━━━━━━━━━━━━━━━━━━
🧶 Pattern Instructions
━━━━━━━━━━━━━━━━━━━━━━

${cleanSteps}

━━━━━━━━━━━━━━━━━━━━━━
🪡 Assembly Instructions
━━━━━━━━━━━━━━━━━━━━━━

${assembly?.trim() || 'Not specified.'}`;
}
export default formatPatternOutput;
