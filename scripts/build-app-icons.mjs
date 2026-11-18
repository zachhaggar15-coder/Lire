import { fileURLToPath } from "node:url";
import sharp from "sharp";

// The owner-supplied Sorlio speech mark is checked in so the web and Android
// packages can always be regenerated from the same source.
const mark = await sharp(fileURLToPath(new URL("../public/brand-mark.png", import.meta.url))).png().toBuffer();

async function render(path, size, markFraction, rounded = false) {
  const radius = rounded ? Math.round(size * 0.22) : 0;
  const background = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" rx="${radius}" fill="#fff"/></svg>`
  );
  const markSize = Math.round(size * markFraction);
  const image = await sharp(mark).resize(markSize, markSize, { fit: "contain" }).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: background, left: 0, top: 0 },
      { input: image, left: Math.floor((size - markSize) / 2), top: Math.floor((size - markSize) / 2) },
    ])
    .png()
    .toFile(fileURLToPath(new URL(`../${path}`, import.meta.url)));
}

await render("public/icon-192.png", 192, 0.78, true);
await render("public/icon-512.png", 512, 0.78, true);
await render("public/icon-maskable-512.png", 512, 0.68);
await render("android/store_icon.png", 512, 0.78, true);

for (const [density, size] of Object.entries({ mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 })) {
  await render(`android/app/src/main/res/mipmap-${density}/ic_launcher.png`, size, 0.78, true);
  await render(`android/app/src/main/res/mipmap-${density}/ic_maskable.png`, Math.round(size * 82 / 48), 0.68);
}
for (const [density, size] of Object.entries({ mdpi: 300, hdpi: 450, xhdpi: 600, xxhdpi: 900, xxxhdpi: 1200 })) {
  await render(`android/app/src/main/res/drawable-${density}/splash.png`, size, 0.7, true);
}
