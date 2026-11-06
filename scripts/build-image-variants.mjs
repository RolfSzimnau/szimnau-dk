// Writes 800 px wide copies of every JPEG in dist/blog-images/ to dist/blog-images/w800/.
// Runs after astro build and before pagefind. Images that are already 800 px or narrower are copied as they are.
// BlogPost.astro and BlogCard.astro point srcset at these files (src/utils/image-variants.ts).
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = path.resolve('dist/blog-images');
const OUT = path.join(SRC, 'w800');
const WIDTH = 800;

await fs.mkdir(OUT, { recursive: true });
const files = (await fs.readdir(SRC)).filter((f) => /\.jpe?g$/i.test(f));

let resized = 0;
let copied = 0;
for (const file of files) {
  const from = path.join(SRC, file);
  const to = path.join(OUT, file);
  const { width = 0 } = await sharp(from).metadata();
  if (width > WIDTH) {
    await sharp(from).resize({ width: WIDTH }).jpeg({ quality: 80, mozjpeg: true }).toFile(to);
    resized++;
  } else {
    await fs.copyFile(from, to);
    copied++;
  }
}
console.log(`Image variants: ${resized} resized to ${WIDTH} px, ${copied} copied as they are (dist/blog-images/w800/)`);
