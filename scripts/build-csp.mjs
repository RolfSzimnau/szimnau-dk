// Post-build step: adds a Content-Security-Policy to dist/_headers.
// Astro and the pagefind search page emit inline scripts, so script-src needs
// a SHA-256 hash for each one. Hashes are computed from the built HTML, which
// keeps the policy correct when a script changes. No 'unsafe-inline' for scripts.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const DIST = "dist";
const HEADERS = join(DIST, "_headers");
// Cloudflare ignores header lines longer than 2,000 characters.
const MAX_LINE = 2000;

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? htmlFiles(join(dir, e.name)) : e.name.endsWith(".html") ? [join(dir, e.name)] : [],
  );
}

const hashes = new Set();
for (const file of htmlFiles(DIST)) {
  for (const [, attrs, body] of readFileSync(file, "utf8").matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc=/.test(attrs) || /ld\+json/.test(attrs)) continue; // external, or data block that never executes
    hashes.add(`'sha256-${createHash("sha256").update(body).digest("base64")}'`);
  }
}

const policy = [
  "default-src 'self'",
  // static.cloudflareinsights.com: Cloudflare Web Analytics beacon (see privacy page)
  // wasm-unsafe-eval: pagefind search loads WebAssembly
  `script-src 'self' ${[...hashes].sort().join(" ")} 'wasm-unsafe-eval' https://static.cloudflareinsights.com`,
  // Shiki code blocks use inline style attributes, which cannot be hashed
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self' https://cloudflareinsights.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const line = `  Content-Security-Policy: ${policy}`;
if (line.length > MAX_LINE) {
  console.error(`CSP line is ${line.length} characters, limit is ${MAX_LINE}. Reduce inline scripts.`);
  process.exit(1);
}

const lines = readFileSync(HEADERS, "utf8").split("\n").filter((l) => !l.includes("Content-Security-Policy"));
const at = lines.findIndex((l) => l.trim() === "/*");
if (at === -1) {
  console.error("dist/_headers has no /* block");
  process.exit(1);
}
lines.splice(at + 1, 0, line);
writeFileSync(HEADERS, lines.join("\n"));
console.log(`CSP added to dist/_headers (${hashes.size} inline script hashes, ${line.length} chars)`);
