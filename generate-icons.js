/**
 * generate-icons.js
 * Generates favicon.ico (48x48), icon.png (512x512), apple-icon.png (180x180)
 * from the source logo, placing them in app/ for Next.js App Router auto-detection.
 * Run once with: node generate-icons.js
 */

const sharp = require('./node_modules/sharp');
const path = require('path');
const fs = require('fs');

const SOURCE = path.join(__dirname, 'app', 'اللوجو.png');
const APP_DIR = path.join(__dirname, 'app');

async function main() {
  console.log('🎨 Verde Favicon Generator');
  console.log('Source:', SOURCE);
  console.log('');

  if (!fs.existsSync(SOURCE)) {
    console.error('❌ Source logo not found:', SOURCE);
    process.exit(1);
  }

  const meta = await sharp(SOURCE).metadata();
  console.log(`📐 Source dimensions: ${meta.width}x${meta.height}`);

  // 1. icon.png → 512x512 (App Router auto-detected)
  const icon512Path = path.join(APP_DIR, 'icon.png');
  await sharp(SOURCE)
    .resize(512, 512, { fit: 'contain', background: { r: 13, g: 40, b: 24, alpha: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(icon512Path);
  const s512 = fs.statSync(icon512Path).size;
  console.log(`✅ icon.png (512×512) → ${(s512 / 1024).toFixed(1)} KB`);

  // 2. apple-icon.png → 180x180 (App Router auto-detected)
  const appleIconPath = path.join(APP_DIR, 'apple-icon.png');
  await sharp(SOURCE)
    .resize(180, 180, { fit: 'contain', background: { r: 13, g: 40, b: 24, alpha: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(appleIconPath);
  const sApple = fs.statSync(appleIconPath).size;
  console.log(`✅ apple-icon.png (180×180) → ${(sApple / 1024).toFixed(1)} KB`);

  // 3. favicon.ico → 48x48 PNG saved as .ico (widely compatible)
  // Sharp can write ICO natively since v0.31+
  const faviconPath = path.join(APP_DIR, 'favicon.ico');
  await sharp(SOURCE)
    .resize(48, 48, { fit: 'contain', background: { r: 13, g: 40, b: 24, alpha: 1 } })
    .toFormat('png')
    .toFile(faviconPath.replace('.ico', '_tmp.png'));

  // Re-read as PNG and write as ico
  const tmpPng = faviconPath.replace('.ico', '_tmp.png');
  const pngBuffer = fs.readFileSync(tmpPng);
  
  // Try sharp ICO support first
  try {
    await sharp(SOURCE)
      .resize(48, 48, { fit: 'contain', background: { r: 13, g: 40, b: 24, alpha: 1 } })
      .toFile(faviconPath);
    fs.unlinkSync(tmpPng);
    console.log(`✅ favicon.ico (48×48) via sharp`);
  } catch (e) {
    // Fallback: rename the PNG to .ico (browsers and Google accept PNG-in-ICO)
    fs.copyFileSync(tmpPng, faviconPath);
    fs.unlinkSync(tmpPng);
    console.log(`✅ favicon.ico (48×48 PNG-as-ICO fallback)`);
  }

  // 4. Also write a 48x48 PNG for public/ as backup reference
  const pub48Path = path.join(__dirname, 'public', 'icon-48.png');
  await sharp(SOURCE)
    .resize(48, 48, { fit: 'contain', background: { r: 13, g: 40, b: 24, alpha: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(pub48Path);
  console.log(`✅ public/icon-48.png (48×48) → backup`);

  // 5. 192x192 for public/icon-192.png (PWA / Android)
  const pub192Path = path.join(__dirname, 'public', 'icon-192.png');
  await sharp(SOURCE)
    .resize(192, 192, { fit: 'contain', background: { r: 13, g: 40, b: 24, alpha: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(pub192Path);
  console.log(`✅ public/icon-192.png (192×192) → PWA`);

  // 6. 512x512 for public/icon-512.png (PWA manifest)
  const pub512Path = path.join(__dirname, 'public', 'icon-512.png');
  await sharp(SOURCE)
    .resize(512, 512, { fit: 'contain', background: { r: 13, g: 40, b: 24, alpha: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(pub512Path);
  console.log(`✅ public/icon-512.png (512×512) → PWA manifest`);

  // 7. apple-touch-icon.png in public/ (fallback for older links)
  const pubApplePath = path.join(__dirname, 'public', 'apple-touch-icon.png');
  await sharp(SOURCE)
    .resize(180, 180, { fit: 'contain', background: { r: 13, g: 40, b: 24, alpha: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(pubApplePath);
  console.log(`✅ public/apple-touch-icon.png (180×180)`);

  console.log('');
  console.log('🎉 All icons generated successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Run: npm run dev');
  console.log('  2. Open: http://localhost:3000/favicon.ico');
  console.log('  3. Open: http://localhost:3000/icon.png');
  console.log('  4. Hard refresh browser: Ctrl + Shift + R');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
