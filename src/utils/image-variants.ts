import sharp from 'sharp';

// The 800 px copies are written by scripts/build-image-variants.mjs. Only JPEGs get one.
const VARIANT_WIDTH = 800;
const widths = new Map<string, Promise<number>>();

const sourceWidth = (src: string): Promise<number> => {
  let w = widths.get(src);
  if (!w) {
    w = sharp(`public${src}`).metadata().then((m) => m.width ?? 0).catch(() => 0);
    widths.set(src, w);
  }
  return w;
};

// srcset for a /blog-images/ JPEG wider than 800 px, otherwise undefined (WebP, PNG and small JPEGs keep src only).
export const heroSrcset = async (src?: string): Promise<string | undefined> => {
  if (!src || !/^\/blog-images\/[^/]+\.jpe?g$/i.test(src)) return undefined;
  const width = await sourceWidth(src);
  if (width <= VARIANT_WIDTH) return undefined;
  return `${src.replace('/blog-images/', '/blog-images/w800/')} ${VARIANT_WIDTH}w, ${src} ${width}w`;
};
