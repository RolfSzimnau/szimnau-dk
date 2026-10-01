// Danish language check for blog posts: known misspellings (errors) and
// literal translations from English (warnings). Code blocks, inline code,
// URLs and English FAQ entries are skipped. Run: npm run lint:da [files...]
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ERRORS = [
  [/\bforvarming/i, "stavefejl: «forvarmning»"],
  [/\bdet nag jeg\b/i, "grammatik: «det nagede mig»"],
  [/\b(fejle[rdt]?|fejlede) i stilhed\b/i, "anglicisme (failed silently): «holdt op med at virke uden at sige noget»"],
  [/\bunderappreci/i, "anglicisme (underappreciated)"],
];

// Checked only in frontmatter title and description (SEO rule).
const FRONT_ONLY = [
  [/ — | – /, "tankestreg i titel/beskrivelse: brug kolon eller komma"],
];

const WARNINGS = [
  [/\biteration(er|en)?\b/i, "«forsøg» eller «omgange»"],
  [/\bopacitet/i, "«gennemsigtighed»"],
  [/\bswitch(es)?\b/i, "«kontakt» (HA's danske ord) uden for backticks"],
  [/(?<!Info )\bservices?\b/i,"«handling» (HA's danske ord) uden for backticks"],
  [/\beksponere[rt]?\b/i, "«viser» eller «giver adgang til»"],
  [/\b(lowercase|uppercase)\b/i, "«små/store bogstaver»"],
  [/\bcase\b/i, "«store/små bogstaver» eller omskriv"],
  [/\blatens\b/i, "«forsinkelse»"],
  [/\bmatche[rs]?\b/i, "«passe» eller «stemme overens»"],
  [/\bdræn\b|\bnattedræn/i, "«tab» eller «strømforbrug»"],
  [/\bpå tværs af\b/i, "ofte oversat «across»: «på alle», «i hele»"],
  [/\bden rigtige grænse\b/i, "anglicisme (the real limit)"],
  [/\bgør (det|kortet) føles\b/i, "anglicisme (makes it feel)"],
];

function prose(text) {
  // Returns [lineNumber, line] pairs that are Danish prose.
  const out = [];
  const lines = text.split(/\r?\n/);
  let inFront = false, inCode = false, englishFaq = false;
  lines.forEach((raw, i) => {
    if (i === 0 && raw === "---") { inFront = true; return; }
    if (inFront) {
      if (raw === "---") { inFront = false; return; }
      // frontmatter: only title, description and Danish FAQ text
      if (/^\s*- question:/.test(raw)) englishFaq = /^\s*- question: "(What|How|Why|Does|Is|Can|Do|Which|Where|When|Will|Should|Are)\b/.test(raw);
      if (/^(title|description):/.test(raw) || (/^\s*(- question|answer):/.test(raw) && !englishFaq)) out.push([i + 1, raw, true]);
      return;
    }
    if (/^\s*```/.test(raw)) { inCode = !inCode; return; }
    if (inCode) return;
    const line = raw
      .replace(/`[^`]*`/g, "")            // inline code
      .replace(/\]\([^)]*\)/g, "]")        // link targets
      .replace(/https?:\/\/\S+/g, "")
      .replace(/<[^>]+>/g, "");           // html tags and style attributes
    out.push([i + 1, line]);
  });
  return out;
}

const dir = "src/content/blog/da";
const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(dir).filter((f) => f.endsWith(".mdx")).map((f) => join(dir, f));

let errors = 0, warnings = 0;
for (const file of files) {
  for (const [n, line, front] of prose(readFileSync(file, "utf8"))) {
    for (const [re, msg] of ERRORS) if (re.test(line)) { errors++; console.log(`FEJL     ${file}:${n}  ${msg}`); }
    if (front) for (const [re, msg] of FRONT_ONLY) if (re.test(line)) { errors++; console.log(`FEJL     ${file}:${n}  ${msg}`); }
    for (const [re, msg] of WARNINGS) if (re.test(line)) { warnings++; console.log(`ADVARSEL ${file}:${n}  ${msg}`); }
  }
}
console.log(`\n${files.length} filer, ${errors} fejl, ${warnings} advarsler`);
process.exit(errors ? 1 : 0);
