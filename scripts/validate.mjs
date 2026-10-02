// Site validator: enforces the SEO and content rules from CLAUDE.md.
//   node scripts/validate.mjs          source checks + checks on built HTML in dist/
//   node scripts/validate.mjs --src    source checks only (fast, used by the pre-commit hook)
// Errors exit 1 and block the build (Cloudflare keeps the previous deploy live).
// Voice findings are warnings and never block.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { execFileSync } from "node:child_process";

const ORIGIN = "https://szimnau.dk";
const LANGS = ["en", "da", "de"];
const HREFLANG = { "en-US": "en", "da-DK": "da", "de-DE": "de", "x-default": "en" };
const BLOG = "src/content/blog";
const srcOnly = process.argv.includes("--src");

let errors = 0, warnings = 0;
const error = (where, msg) => { errors++; console.log(`✗ ${where}\n    ${msg}`); };
const warn = (where, msg) => { warnings++; console.log(`⚠ ${where}\n    ${msg}`); };

// --- Source checks ---------------------------------------------------------

function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].replace(/^["']|["']$/g, "");
  }
  return data;
}

function trackedFiles() {
  try {
    return new Set(execFileSync("git", ["ls-files", "public"], { encoding: "utf8" }).split("\n"));
  } catch {
    return null;
  }
}

const VOICE = [
  [/\bseamless(ly)?\b/i, "«seamlessly»"],
  [/\ba powerful (pattern|approach|way|tool)\b/i, "«a powerful …»"],
  [/\bthis approach yields\b/i, "«this approach yields»"],
  [/\bleverag(e|es|ing)\b/i, "«leverage»"],
  [/\bgame[- ]changer\b/i, "«game changer»"],
  [/\bdelve\b/i, "«delve»"],
];
const ENDING = /^#{2,3}\s+(Conclusion|Wrapping Up|What's Next|Final Thoughts|Summary|Konklusion|Afrunding|Opsummering|Fazit|Zusammenfassung|Ausblick)\b/i;

function checkSource() {
  const tracked = trackedFiles();
  if (!tracked) warn("git", "git ls-files fejlede, springer tjek af tracked billeder over");
  const keys = new Map();

  for (const lang of LANGS) {
    const dir = join(BLOG, lang);
    for (const name of readdirSync(dir).filter((f) => /\.mdx?$/.test(f))) {
      const file = join(dir, name);
      const text = readFileSync(file, "utf8");
      const fm = frontmatter(text);
      if (!fm) { error(file, "mangler frontmatter"); continue; }

      for (const field of ["title", "description", "pubDate", "lang", "translationKey"]) {
        if (!fm[field]) error(file, `frontmatter mangler «${field}»`);
      }
      if (fm.lang && fm.lang !== lang) error(file, `lang er «${fm.lang}», men filen ligger i ${lang}/`);
      if (fm.translationKey) {
        if (!keys.has(fm.translationKey)) keys.set(fm.translationKey, new Set());
        keys.get(fm.translationKey).add(lang);
      }

      // Every /blog-images/ reference must exist on disk and be tracked in git.
      const images = new Set([...text.matchAll(/\/blog-images\/[^\s"')\]>]+/g)].map((m) => m[0]));
      for (const img of images) {
        const path = join("public", img);
        if (!existsSync(path)) error(file, `billedet ${img} findes ikke i public/`);
        else if (tracked && !tracked.has(path)) error(file, `billedet ${img} er ikke tracked i git (git add ${path})`);
      }

      // Voice: prose only, code blocks and inline code skipped.
      let inCode = false, inFront = false;
      text.split(/\r?\n/).forEach((line, i) => {
        if (i === 0 && line === "---") { inFront = true; return; }
        if (inFront) { if (line === "---") inFront = false; return; }
        if (/^\s*```/.test(line)) { inCode = !inCode; return; }
        if (inCode) return;
        if (ENDING.test(line)) warn(`${file}:${i + 1}`, `afsluttende opsummering: «${line.replace(/^#+\s+/, "")}»`);
        const prose = line.replace(/`[^`]*`/g, "");
        for (const [re, msg] of VOICE) if (re.test(prose)) warn(`${file}:${i + 1}`, `AI-frase ${msg}`);
      });
    }
  }

  for (const [key, langs] of keys) {
    const missing = LANGS.filter((l) => !langs.has(l));
    if (missing.length) error(`translationKey «${key}»`, `mangler version på: ${missing.join(", ")}`);
  }
}

// --- Built HTML checks -----------------------------------------------------

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "pagefind" || name === "_astro" ? [] : htmlFiles(path);
    return name.endsWith(".html") ? [path] : [];
  });
}

const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
const meta = (html, key, value) => {
  const tag = html.match(new RegExp(`<meta[^>]*\\b${key}="${value}"[^>]*>`))?.[0];
  return tag ? attr(tag, "content") : undefined;
};
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

function checkDist() {
  if (!existsSync("dist")) { error("dist/", "findes ikke, kør astro build først"); return; }
  const descriptions = new Map();

  for (const file of htmlFiles("dist")) {
    const page = "/" + relative("dist", file).replace(/\\/g, "/").replace(/index\.html$/, "");
    const html = readFileSync(file, "utf8");
    const robots = meta(html, "name", "robots");
    if (robots?.includes("noindex")) continue; // 404 and similar
    if (/http-equiv="refresh"/i.test(html)) continue; // redirect stubs
    const where = relative(".", file);

    const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "");
    if (!title) error(where, "mangler <title>");
    else if (!title.endsWith(" | szimnau.dk")) error(where, `title følger ikke formatet «[Titel] | szimnau.dk»: «${title}»`);

    const desc = decode(meta(html, "name", "description") ?? "");
    if (!desc) error(where, "mangler meta description");
    else {
      if (desc.length < 120 || desc.length > 160) error(where, `meta description er ${desc.length} tegn (skal være 120–160)`);
      if (!descriptions.has(desc)) descriptions.set(desc, []);
      descriptions.get(desc).push(where);
    }

    if (robots !== "index, follow") error(where, `meta robots er «${robots ?? "mangler"}», skal være «index, follow»`);

    const canonical = attr(html.match(/<link[^>]*rel="canonical"[^>]*>/)?.[0] ?? "", "href");
    const expected = ORIGIN + encodeURI(page);
    if (!canonical) error(where, "mangler canonical");
    else if (canonical !== expected) error(where, `canonical er ${canonical}, forventede ${expected}`);

    // Tag pages skip hreflang on purpose: tag slugs differ per language (SEO.astro).
    const isTag = page.includes("/blog/tag/");
    const alternates = [...html.matchAll(/<link[^>]*rel="alternate"[^>]*hreflang="([^"]+)"[^>]*>/g)];
    const found = new Map(alternates.map((m) => [m[1], attr(m[0], "href")]));
    if (!isTag) for (const [code, lang] of Object.entries(HREFLANG)) {
      const href = found.get(code);
      if (!href) { error(where, `mangler hreflang ${code}`); continue; }
      if (!href.startsWith(ORIGIN + "/") || !href.endsWith("/")) error(where, `hreflang ${code} skal være absolut med / til sidst: ${href}`);
      else if (!href.startsWith(`${ORIGIN}/${lang}/`)) error(where, `hreflang ${code} peger på ${href}, forventede /${lang}/`);
    }

    for (const p of ["og:title", "og:description", "og:type", "og:url", "og:image", "og:site_name", "og:locale"]) {
      if (!meta(html, "property", p)) error(where, `mangler ${p}`);
    }
    for (const n of ["twitter:card", "twitter:site", "twitter:creator", "twitter:title", "twitter:description", "twitter:image"]) {
      if (!meta(html, "name", n)) error(where, `mangler ${n}`);
    }
    const ogImage = meta(html, "property", "og:image");
    if (ogImage) {
      if (!ogImage.startsWith(ORIGIN + "/")) error(where, `og:image skal være absolut URL: ${ogImage}`);
      else if (!existsSync(join("dist", decodeURIComponent(ogImage.slice(ORIGIN.length))))) error(where, `og:image findes ikke: ${ogImage}`);
    }

    const body = html.replace(/<script[\s\S]*?<\/script>/g, "");
    const levels = [...body.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
    const h1 = levels.filter((l) => l === 1).length;
    if (h1 !== 1) error(where, `har ${h1} <h1>, skal have præcis én`);
    let prev = 0;
    for (const l of levels) {
      if (l > prev + 1) { error(where, `overskrift springer fra h${prev || "-"} til h${l}`); break; }
      prev = l;
    }

    const hero = body.match(/<img[^>]*fetchpriority="high"[^>]*>/)?.[0];
    if (hero && /\/blog\/[^/]+\/$/.test(page) && !isTag) {
      for (const [k, v] of [["width", "768"], ["height", "432"], ["loading", "eager"], ["decoding", "async"]]) {
        if (attr(hero, k) !== v) error(where, `hero-billede skal have ${k}="${v}"`);
      }
    }
  }

  for (const [desc, pages] of descriptions) {
    if (pages.length > 1) error(pages.join(", "), `samme meta description på ${pages.length} sider: «${desc.slice(0, 60)}…»`);
  }
}

checkSource();
if (!srcOnly) checkDist();
console.log(`\n${errors} fejl, ${warnings} advarsler`);
process.exit(errors ? 1 : 0);
