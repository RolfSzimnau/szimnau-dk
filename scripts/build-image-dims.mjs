// Adds width and height to every <img> in dist/ that points at a local file and has neither.
// Markdown images in post bodies come out without dimensions, so the text below them jumps
// when the image loads (CLS). Runs after astro build and before pagefind.
// .prose img has height: auto in global.css, so the attributes only reserve the aspect ratio.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const DIST = path.resolve('dist');
const sizes = new Map();

async function sizeOf(src) {
  if (!sizes.has(src)) {
    try {
      const { width, height } = await sharp(path.join(DIST, decodeURI(src))).metadata();
      sizes.set(src, width && height ? { width, height } : null);
    } catch {
      sizes.set(src, null);
    }
  }
  return sizes.get(src);
}

async function* htmlFiles(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(full);
    else if (entry.name.endsWith('.html')) yield full;
  }
}

let tagged = 0;
let pages = 0;
for await (const file of htmlFiles(DIST)) {
  const html = await fs.readFile(file, 'utf8');
  const tags = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  let out = html;
  for (const tag of new Set(tags)) {
    if (/\s(width|height)=/.test(tag)) continue;
    const src = tag.match(/\ssrc="(\/[^"?#]+)"/)?.[1];
    if (!src) continue;
    const size = await sizeOf(src);
    if (!size) continue;
    const next = tag.replace(/^<img\b/, `<img width="${size.width}" height="${size.height}"`);
    const count = out.split(tag).length - 1;
    out = out.split(tag).join(next);
    tagged += count;
  }
  if (out !== html) {
    await fs.writeFile(file, out);
    pages++;
  }
}
console.log(`Image dimensions: ${tagged} img tags given width and height on ${pages} pages`);
