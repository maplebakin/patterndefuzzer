/**
 * Format a scraped pattern into a clean, copy-ready Markdown summary.
 * - Accepts arrays or strings for steps/notes
 * - De-duplicates repeated lines
 * - Normalizes whitespace & line breaks
 * - Groups common tips into readable sections
 */

const toArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  // split on newlines or sentence-ish boundaries
  return String(val)
    .split(/\r?\n|(?<=[.?!])\s+(?=[A-Z*])/)
    .map((s) => s.trim())
    .filter(Boolean);
};

const uniq = (arr) => {
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    const k = item.replace(/\s+/g, " ").trim().toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      out.push(item.trim());
    }
  }
  return out;
};

const asList = (arr) => (arr.length ? arr.map((l) => `- ${l}`).join("\n") : "");

const sectionList = (title, arr) =>
  arr.length ? `### ${title}\n\n${asList(arr)}` : "";

const sectionText = (title, text) => {
  const parts = toArray(text);
  return parts.length ? `### ${title}\n\n${parts.join("\n\n")}` : "";
};

const stepsList = (title, steps, fallbackText) => {
  const list = uniq(toArray(steps));
  if (list.length) return `### ${title}\n\n${asList(list)}`;
  const fb = uniq(toArray(fallbackText));
  if (fb.length) return `### ${title}\n\n${asList(fb)}`;
  return `### ${title}\n\nNot specified.`;
};

export function formatPatternOutput({
  title = "Untitled Pattern",
  source = "Not specified",
  yarn = "Not specified",
  hookSize = "Not specified",

  // Flexible inputs – can be arrays or strings:
  gauge = [],
  hookAndYarnInfo = [],
  tips = [],
  rowStartConversions = [],
  increases = [],
  decreases = [],
  backSteps = [],
  frontSteps = [],
  assemblySteps = [],
  backPiece = "",
  frontPiece = "",
  assembly = "",
} = {}) {
  // Normalize and dedupe all arrays
  const _gauge = uniq(toArray(gauge));
  const _hookInfo = uniq(toArray(hookAndYarnInfo));
  const _tips = uniq(toArray(tips));
  const _rowStarts = uniq(toArray(rowStartConversions));
  const _incs = uniq(toArray(increases));
  const _decs = uniq(toArray(decreases));

  // Light heuristic categorization pulled from your prior version
  const gaugeTips = _tips.filter((t) => /10\s*x\s*10\s*cm|gauge/i.test(t));
  const hookTips = _tips.filter(
    (t) => /hook size|chain stitch.*(wide|tight)|hook the chain/i.test(t)
  );
  const diagramTips = _tips.filter((t) => /see diagrams?/i.test(t));
  const startConversions =
    _rowStarts.length ? _rowStarts : _tips.filter((t) => /beginning of.*row/i.test(t));
  const increaseTips = _incs.length ? _incs : _tips.filter((t) => /increase/i.test(t));
  const decreaseTips = _decs.length ? _decs : _tips.filter((t) => /decrease|slip stitch/i.test(t));

  const tipsSection = [
    _gauge.length ? sectionList("🧾 Gauge", _gauge) : "",
    _hookInfo.length ? sectionList("🪝 Hook & Yarn Notes", _hookInfo) : "",
    sectionList("📊 Diagrams", diagramTips),
    sectionList("🔁 Row Start Conversions", startConversions),
    sectionList("➕ Increases", increaseTips),
    sectionList("➖ Decreases", decreaseTips),
  ]
    .filter(Boolean)
    .join("\n\n");

  const header = [
    `📌 Pattern: ${title}`,
    `🔗 Source: ${source}`,
    `🧵 Yarn Used: ${yarn}`,
    `🪝 Hook Size: ${hookSize}`,
  ].join("  \n");

  const disclaimer = [
    "_This is a readability summary. Always visit and support the original designer._",
    "_For personal reference only. Do not redistribute full patterns._",
  ].join("\n");

  return `${header}

━━━━━━━━━━━━━━━━━━━━━━
🧶 Pattern Summary
━━━━━━━━━━━━━━━━━━━━━━

${tipsSection || "_No general notes provided._"}

---

${stepsList("🔹 BACK PIECE", backSteps, backPiece)}

---

${stepsList("🔹 FRONT PIECE", frontSteps, frontPiece)}

---

${stepsList("🪡 Assembly Instructions", assemblySteps, assembly)}

---

${sectionText("🔗 Visit Original", source)}

${disclaimer}

━━━━━━━━━━━━━━━━━━━━━━`;
}

export default formatPatternOutput;
