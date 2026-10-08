// Regenerates the Play Store feature graphic from an inline SVG. Run with:
//   node scripts/generate-play-assets.mjs
// Requires the `sharp` devDependency (already in package.json).
//
// Play's feature graphic is 1024x500 with no alpha channel. It is cropped
// differently across Play surfaces, so nothing small or load-bearing sits near
// an edge: the mark and the wordmark both live well inside the safe centre.
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "docs", "play-assets");

// The mark, lifted from public/icon.svg so the two can never drift apart.
const mark = (x, y, size) => {
  const s = size / 512;
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect width="512" height="512" rx="112" fill="#16593C"/>
    <circle cx="256" cy="176" r="66" fill="#F9D96B"/>
    <path d="M152 280h98v176l-114-16v-144q0-16 16-16z" fill="#FFFCF4"/>
    <path d="M360 280h-98v176l114-16v-144q0-16-16-16z" fill="#E4EFE7"/>
  </g>`;
};

const featureGraphic = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs>
    <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="#F9D96B" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#F9D96B" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="500" fill="#FFFCF4"/>
  <circle cx="880" cy="90" r="340" fill="url(#sun)"/>
  ${mark(84, 110, 280)}
  <text x="430" y="245" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="118" font-weight="700" fill="#16593C">Sorlio</text>
  <text x="436" y="315" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="40" font-weight="400" fill="#16593C" opacity="0.78">Read real French.</text>
  <text x="436" y="367" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="40" font-weight="400" fill="#16593C" opacity="0.78">Tap any word.</text>
</svg>`;

async function main() {
  await sharp(Buffer.from(featureGraphic))
    .flatten({ background: "#FFFCF4" })   // Play rejects an alpha channel here
    .png()
    .toFile(path.join(outDir, "feature-graphic-1024x500.png"));
  console.log("Generated docs/play-assets/feature-graphic-1024x500.png");
}

main();
