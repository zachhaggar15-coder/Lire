// Regenerates public/icon-*.png from the SVG sources. Run with:
//   node scripts/generate-icons.mjs
// Requires the `sharp` devDependency (already in package.json).
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public");

const anySvg = readFileSync(path.join(publicDir, "icon.svg"));
const maskableSvg = readFileSync(path.join(publicDir, "icon-maskable-source.svg"));

async function main() {
  await sharp(anySvg).resize(192, 192).png().toFile(path.join(publicDir, "icon-192.png"));
  await sharp(anySvg).resize(512, 512).png().toFile(path.join(publicDir, "icon-512.png"));
  await sharp(maskableSvg).resize(512, 512).png().toFile(path.join(publicDir, "icon-maskable-512.png"));
  console.log("Generated icon-192.png, icon-512.png, icon-maskable-512.png");
}

main();
