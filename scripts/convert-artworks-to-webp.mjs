import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const ARTWORKS_DIR = path.join(ROOT, "public", "artworks");
const OUT_EXT = ".webp";

const INPUT_EXTS = new Set([".jpg", ".jpeg", ".png"]);

async function main() {
  const entries = await fs.readdir(ARTWORKS_DIR, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => INPUT_EXTS.has(path.extname(name).toLowerCase()));

  let converted = 0;
  let skipped = 0;

  for (const file of files) {
    const inPath = path.join(ARTWORKS_DIR, file);
    const outPath = path.join(
      ARTWORKS_DIR,
      `${path.basename(file, path.extname(file))}${OUT_EXT}`,
    );

    try {
      await fs.access(outPath);
      skipped++;
      continue;
    } catch {
      // not exists -> convert
    }

    await sharp(inPath)
      .webp({ quality: 80 })
      .toFile(outPath);

    converted++;
  }

  // eslint-disable-next-line no-console
  console.log(
    `Converted ${converted} file(s) to WebP. Skipped ${skipped} existing WebP file(s).`,
  );
}

await main();

