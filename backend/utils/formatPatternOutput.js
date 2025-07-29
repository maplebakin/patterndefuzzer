export function formatPatternOutput({ title, source, yarn, hookSize, patternSteps, assembly }) {
  const cleanSteps = patternSteps
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

${cleanSteps || 'No instructions found.'}

━━━━━━━━━━━━━━━━━━━━━━
🪡 Assembly Instructions
━━━━━━━━━━━━━━━━━━━━━━

${assembly.trim() || 'Not specified.'}`;
}
