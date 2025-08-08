/**
 * Convert a block of instructions into a clean array of step strings.
 * - Accepts string OR array input
 * - Recognizes bullet points and numbered lists
 * - Groups sentences by action keywords (Work, Turn, Continue, etc.)
 * - Avoids splitting on common abbreviations (cm., mm., etc.)
 * - Deduplicates, trims, and normalizes whitespace
 */

const toArray = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean).map((s) => String(s).trim());
  return String(raw)
    .replace(/\r/g, "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
};

// Protect common abbreviations so they don’t trigger sentence splits
function protectAbbreviations(text) {
  return text
    .replace(/\bcm\./gi, "cm<dot>")
    .replace(/\bmm\./gi, "mm<dot>")
    .replace(/\bapprox\./gi, "approx<dot>")
    .replace(/\betc\./gi, "etc<dot>")
    .replace(/\beg\./gi, "eg<dot>")
    .replace(/\bi\.e\./gi, "ie<dot>");
}
function unprotectAbbreviations(text) {
  return text
    .replace(/<dot>/g, "."); // single pass is fine; tokens are unique
}

const ACTION_START = new RegExp(
  String.raw`^(?:Work|Turn|Read|Continue|Decrease|Increase|Cast off|Cast on|Begin|Cut and fasten|Now work|When piece|Repeat|Sew|Start|Make (?:1 )?yarn over|At (?:the )?beginning|At (?:the )?end|Fasten off|Join|Split|Shape|Change to|Skip|Ch [0-9]+|Sc|Dc|Hdc|Tr|Round|Row)\b`,
  "i"
);

export default function formatInstructionsToSteps(raw = "") {
  // 1) Normalize into lines
  const lines = toArray(raw);

  // 2) Collapse into a single paragraph so we can split smartly
  let text = unprotectAbbreviations(
    protectAbbreviations(
      lines
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
    )
  );

  if (!text) return [];

  // 3) First pass: split on obvious bullets/numbered items
  // e.g., "1. Do X", "- Do Y", "• Do Z", "Row 1:", "Round 3:"
  let chunks = text
    .split(/(?:\s*(?:^|)(?:[-•]\s+|\d+\.\s+|Row\s+\d+:|Round\s+\d+:)\s*)/i)
    .map((s) => s.trim())
    .filter(Boolean);

  // If we didn’t find any bullet structure, split by sentence-ish boundaries,
  // then re-group by action keywords so steps stay meaningful.
  if (chunks.length <= 1) {
    const sentences = protectAbbreviations(text)
      .split(/(?<=[.?!])\s+(?=[A-Z*])/)
      .map(unprotectAbbreviations)
      .map((s) => s.trim())
      .filter(Boolean);

    const grouped = [];
    let buf = "";

    const pushBuf = () => {
      if (buf) {
        grouped.push(buf.trim());
        buf = "";
      }
    };

    for (const s of sentences) {
      if (!buf) {
        buf = s;
        continue;
      }
      // If this sentence *looks* like a new action, start a new step
      if (ACTION_START.test(s)) {
        pushBuf();
        buf = s;
      } else {
        buf += (buf.endsWith(".") ? " " : " ") + s;
      }
    }
    pushBuf();

    chunks = grouped.length ? grouped : sentences;
  }

  // 4) Post-process each chunk: normalize spaces, ensure sentence end.
  const steps = chunks
    .map((s) => s.replace(/\s+/g, " ").trim())
    .map((s) => (/[.?!)]$/.test(s) ? s : s + ".")) // add period if missing
    .map((s) => s.replace(/\s*,\./g, ".")) // clean ",."
    .map((s) => s.replace(/\s+;$/g, ".")); // trailing semicolon → period

  // 5) Deduplicate while preserving order
  const seen = new Set();
  const unique = [];
  for (const s of steps) {
    const key = s.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(s);
    }
  }

  // 6) Optional: merge tiny trailing steps into previous one for readability
  const merged = [];
  for (const s of unique) {
    const short = s.length < 25;
    if (short && merged.length) {
      merged[merged.length - 1] = merged[merged.length - 1].replace(/\.$/, "") + " " + s;
    } else {
      merged.push(s);
    }
  }

  return merged;
}
