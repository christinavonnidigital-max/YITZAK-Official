import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- Solid dark-green background with zero transparent padding -->
  <rect width="512" height="512" fill="#023625" />
  
  <!-- Simplified Shield Outline (Gold / White) -->
  <path
    d="M 256 64 C 344 112 422 116 430 134 C 434 236 408 336 256 448 C 104 336 78 236 82 134 C 90 116 168 112 256 64 Z"
    fill="none"
    stroke="#E6CA85"
    stroke-width="32"
    stroke-linejoin="round"
    stroke-linecap="round"
  />

  <!-- Bold Simplified Tick / Checkmark (White) -->
  <path
    d="M 180 256 L 236 316 L 336 196"
    fill="none"
    stroke="#FFFFFF"
    stroke-width="40"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>`;

async function run() {
  const publicDir = path.resolve(process.cwd(), 'public');

  // Save the SVG
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);

  // Render 512x512 PNG using Resvg
  const resvg = new Resvg(svgContent, {
    fitTo: { mode: 'width', value: 512 },
  });
  const pngData = resvg.render().asPng();

  const p512 = path.join(publicDir, 'favicon-512.png');
  const p180 = path.join(publicDir, 'apple-touch-icon.png');
  const p48 = path.join(publicDir, 'favicon-48.png');
  const p32 = path.join(publicDir, 'favicon-32.png');
  const p16 = path.join(publicDir, 'favicon-16.png');
  const pIco = path.join(publicDir, 'favicon.ico');

  // Save 512x512
  fs.writeFileSync(p512, pngData);
  console.log('Created favicon-512.png');

  // Save Apple touch icon (180x180)
  await sharp(pngData).resize(180, 180).toFile(p180);
  console.log('Created apple-touch-icon.png (180x180)');

  // Save 48x48, 32x32, 16x16
  await sharp(pngData).resize(48, 48).toFile(p48);
  await sharp(pngData).resize(32, 32).toFile(p32);
  await sharp(pngData).resize(16, 16).toFile(p16);
  console.log('Created 48x48, 32x32, 16x16 PNGs');

  // Convert to multi-resolution ICO (16, 32, 48)
  const icoBuf = await pngToIco([p16, p32, p48]);
  fs.writeFileSync(pIco, icoBuf);
  console.log('Created multi-resolution favicon.ico (16, 32, 48px)');

  // Also create favicon.png for standard fallbacks
  await sharp(pngData).resize(512, 512).toFile(path.join(publicDir, 'favicon.png'));
  console.log('Favicon generation complete!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
