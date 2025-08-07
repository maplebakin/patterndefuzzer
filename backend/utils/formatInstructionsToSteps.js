export default function formatInstructionsToSteps(raw = '') {
  if (!raw) return [];

  const lines = raw
    .split(/(?<=[.?!])\s+(?=[A-Z])/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const steps = [];
  let buffer = '';

  for (const line of lines) {
    // Start a new step if buffer exists and line looks like a new idea
    if (
      buffer &&
      /^[A-Z]/.test(line) &&
      /(?:Work|Turn|Read|Continue|Decrease|Increase|Cast off|Begin|Cut and fasten|Now work|When piece|Repeat|Sew|Start|Make 1 yarn over|At (the )?beginning)/.test(line)
    ) {
      steps.push(buffer.trim());
      buffer = line;
    } else {
      buffer += (buffer ? ' ' : '') + line;
    }
  }

  if (buffer) steps.push(buffer.trim());

  return steps;
}
