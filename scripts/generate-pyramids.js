const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const products = [
  {
    slug: 'fortis-rex',
    sourceImg: 'public/pyramids/fortis-rex.jpg',
    topNotes: 'نسيم البحر، الجريب فروت، المندرين',
    heartNotes: 'ورق الغار، الياسمين',
    baseNotes: 'العنبر الأشهب، خشب الغاياك، البلوط',
  },
  {
    slug: 'sultan-dore',
    sourceImg: 'public/pyramids/sultan-dore.jpg',
    topNotes: 'الأناناس، الجريب فروت، البرغموت',
    heartNotes: 'خشب الأرز، الباتشولي، الياسمين',
    baseNotes: 'طحلب البلوط، الأخشاب الجافة',
  },
  {
    slug: 'marin-bleu',
    sourceImg: 'public/pyramids/marin-bleu.jpg',
    topNotes: 'مياه البحر، البرغموت، الليمون',
    heartNotes: 'الأعشاب البحرية، الكالون، الهيديون',
    baseNotes: 'المسك، الأمبروكسان، خشب الأرز',
  },
  {
    slug: 'frost-line',
    sourceImg: 'public/pyramids/frost-line.jpg',
    topNotes: 'الكشمش الأسود، الأترج، النعناع',
    heartNotes: 'الريحان، الورد، الكزبرة',
    baseNotes: 'التمر، التين، بذور الأمبريت',
  },
  {
    slug: 'blanc-pur',
    sourceImg: 'public/pyramids/blanc-pur.jpg',
    topNotes: 'الجريب فروت، إكليل الجبل، الهيل',
    heartNotes: 'مسك الروم، الإيلنغ',
    baseNotes: 'جلد الشامواه، خشب الأرز',
  },
  {
    slug: 'mangue-epicee',
    sourceImg: 'public/pyramids/mangue-epicee.jpg',
    topNotes: 'المانجو، الليمون، الزنجبيل، التوت',
    heartNotes: 'الكومارين، الياسمين، الأخشاب',
    baseNotes: 'العنبر، خشب العود، المسك',
  },
];

async function generateArabicPyramids() {
  const width = 800;
  const height = 1000;

  for (const p of products) {
    const pyramidResized = await sharp(p.sourceImg)
      .resize(470, 780, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toBuffer();

    const svgText = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .tier-title {
          font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
          font-size: 27px;
          font-weight: 700;
          fill: #161816;
          text-anchor: end;
        }
        .tier-notes {
          font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
          font-size: 19px;
          font-weight: 400;
          fill: #555855;
          text-anchor: end;
        }
      </style>

      <!-- Top Notes -->
      <g transform="translate(760, 255)">
        <text class="tier-title" x="0" y="0">القمة العطرية</text>
        <text class="tier-notes" x="0" y="34">${escapeXml(p.topNotes)}</text>
      </g>

      <!-- Heart Notes -->
      <g transform="translate(760, 500)">
        <text class="tier-title" x="0" y="0">قلب العطر</text>
        <text class="tier-notes" x="0" y="34">${escapeXml(p.heartNotes)}</text>
      </g>

      <!-- Base Notes -->
      <g transform="translate(760, 745)">
        <text class="tier-title" x="0" y="0">قاعدة العطر</text>
        <text class="tier-notes" x="0" y="34">${escapeXml(p.baseNotes)}</text>
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

    console.log(`Generated Arabic: ${outPath}`);
  }

  const mbSrc = path.join(__dirname, '..', 'public', 'pyramids', 'marin-bleu-composite.jpg');
  const mbDst = path.join(__dirname, '..', 'public', 'pyramids', 'marin-blue-composite.jpg');
  fs.copyFileSync(mbSrc, mbDst);
  console.log('All Arabic composite images generated successfully!');
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

generateArabicPyramids().catch(console.error);
