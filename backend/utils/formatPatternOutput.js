// formatPatternOutput.js

export function formatPatternOutput({ title, source, yarn, hookSize, patternSteps, assembly }) {
  return `Title: ${title}
Source: ${source}
Yarn: ${yarn}
Hook Size: ${hookSize}

🧶 Pattern Instructions
${patternSteps.trim()}

🪡 Assembly Instructions
${assembly.trim()}`;
}
