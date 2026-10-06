const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const products = [
  {
    slug: 'fortis-rex',
    sourceImg: 'public/pyramids/fortis-rex.jpg',
    topNotes: 'Sea Notes, Grapefruit, Mandarin',
    heartNotes: 'Bay Leaf, Jasmine',
    baseNotes: 'Ambergris, Guaiac Wood, Oakmoss',
  },
  {
    slug: 'sultan-dore',
    sourceImg: 'public/pyramids/sultan-dore.jpg',
    topNotes: 'Pineapple, Grapefruit, Bergamot',
    heartNotes: 'Cedarwood, Patchouli, Jasmine',
    baseNotes: 'Oakmoss, Dry Woody Notes',
  },
  {
    slug: 'marin-bleu',
    sourceImg: 'public/pyramids/marin-bleu.jpg',
    topNotes: 'Sea Water, Bergamot, Lemon',
    heartNotes: 'Seaweed, Calone, Hedione',
    baseNotes: 'Musk, Ambroxan, Cedarwood',
  },
  {
    slug: 'frost-line',
    sourceImg: 'public/pyramids/frost-line.jpg',
    topNotes: 'Black Currant, Citron, Mint, Lemon',
    heartNotes: 'Basil, Rose, Coriander',
    baseNotes: 'Dates, Fig, Ambrette',
  },
  {
    slug: 'blanc-pur',
    sourceImg: 'public/pyramids/blanc-pur.jpg',
    topNotes: 'Grapefruit, Rosemary, Cardamom',
    heartNotes: 'Tuberose, Ylang-Ylang',
    baseNotes: 'Suede, Leather, Cedarwood',
  },
  {
    slug: 'mangue-epicee',
    sourceImg: 'public/pyramids/mangue-epicee.jpg',
    topNotes: 'Mango, Lemon, Ginger, Berries',
    heartNotes: 'Coumarin, Jasmine, Dry Woods',
    baseNotes: 'Amber, Agarwood (Oud), Musk',
  },
];

async function generateSinglePyramidImage(p) {
  const width = 800;
  const height = 1000;

  // Resize pyramid to fit left side with clean white background
  const pyramidResized = await sharp(p.sourceImg)
    .resize(470, 780, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();

  const svgText = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <style>
      .tier-title {
        font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
        font-size: 26px;
        font-weight: 700;
        fill: #161816;
        letter-spacing: -0.2px;
      }
      .tier-notes {
        font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
        font-size: 19px;
        font-weight: 400;
        fill: #555855;
        line-height: 1.4;
      }
    </style>

    <!-- Top Notes Tier -->
    <g transform="translate(470, 255)">
      <text class="tier-title" x="0" y="0">Top Notes</text>
      <text class="tier-notes" x="0" y="32">${escapeXml(p.topNotes)}</text>
    </g>

    <!-- Heart Notes Tier -->
    <g transform="translate(470, 500)">
      <text class="tier-title" x="0" y="0">Heart Notes</text>
      <text class="tier-notes" x="0" y="32">${escapeXml(p.heartNotes)}</text>
    </g>

    <!-- Base Notes Tier -->
    <g transform="translate(470, 745)">
      <text class="tier-title" x="0" y="0">Base Notes</text>
      <text class="tier-notes" x="0" y="32">${escapeXml(p.baseNotes)}</text>
    </g>
  </svg>
  `;

  const outPath = path.join(__dirname, '..', 'public', 'pyramids', `${p.slug}-composite.jpg`);

  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([
      { input: pyramidResized, top: 110, left: 15 },
      { input: Buffer.from(svgText), top: 0, left: 0 },
    ])
    .jpeg({ quality: 95 })
    .toFile(outPath);

  console.log(`Generated: ${outPath}`);
}

function escapeXml(str) {
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

async function run() {
  for (const p of products) {
    await generateSinglePyramidImage(p);
  }
  const mbSrc = path.join(__dirname, '..', 'public', 'pyramids', 'marin-bleu-composite.jpg');
  const mbDst = path.join(__dirname, '..', 'public', 'pyramids', 'marin-blue-composite.jpg');
  fs.copyFileSync(mbSrc, mbDst);
  console.log('All composite images generated successfully!');
}

run().catch(console.error);
