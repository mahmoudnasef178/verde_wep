import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

const BASE = 'f:/Verde Wep/prodect images';
const DEST_BASE = 'f:/Verde Wep/verde-web/public/products';

// Map: source PNG  →  gallery slug  →  card filename
const mapping = [
  {
    src: `${BASE}/Blanc Pur/Verde Blanc Pur Perfume Advertisement.png`,
    slug: 'blanc-pur',
    card: 'Blanc Pur.webp',
  },
  {
    src: `${BASE}/Cavaro/Cavaro Verde Perfume Bottle.png`,
    slug: 'cavaro',
    card: 'Cavaro.webp',
  },
  {
    src: `${BASE}/Fortis rex/Verde Fortis Rex Perfume Advertisement.png`,
    slug: 'fortis-rex',
    card: 'Fortis Rex.webp',
  },
  {
    src: `${BASE}/Frost Line/Verde Frost Line Perfume Advertisement.png`,
    slug: 'frost-line',
    card: 'Frost Line.webp',
  },
  {
    src: `${BASE}/Incenso/Verde Incenso Perfume Poster.png`,
    slug: 'incenso',
    card: 'Incenso.webp',
  },
  {
    src: `${BASE}/Mangue Epice/Verde Mangue Epicee Perfume Ad (2).png`,
    slug: 'mangue-epicee',
    card: 'Mangue Epicee.webp',
  },
  {
    src: `${BASE}/Marin Bleu/Luxury VERDE Perfume Editorial Ad.png`,
    slug: 'marin-bleu',
    card: 'Marin Bleu.webp',
  },
  {
    src: `${BASE}/Rexon/Verde Rexon Amber Perfume Bottle.png`,
    slug: 'rexon',
    card: 'Rexon.webp',
  },
  {
    src: `${BASE}/Solver/VERDE SOLVER Perfume Advertisement.png`,
    slug: 'solver',
    card: 'Solver.webp',
  },
  {
    src: `${BASE}/Sultan Dore/Verde Sultan Dore Perfume Advertisement.png`,
    slug: 'sultan-dore',
    card: 'Sultan Dore.webp',
  },
  {
    src: `${BASE}/Velor/Velor Verde Perfume Bottle Ad.png`,
    slug: 'velor',
    card: 'Velor.webp',
  },
];

const W = 1086, H = 1448;

(async () => {
  for (const m of mapping) {
    if (!existsSync(m.src)) {
      console.error('MISSING SOURCE:', m.src);
      continue;
    }

    const galleryDir = path.join(DEST_BASE, m.slug);
    if (!existsSync(galleryDir)) mkdirSync(galleryDir, { recursive: true });

    const gallery1 = path.join(galleryDir, '1.webp');
    const cardPath = path.join(DEST_BASE, m.card);

    // Convert PNG → WebP at same dimensions as existing images
    await sharp(m.src)
      .resize(W, H, { fit: 'cover', position: 'centre' })
      .webp({ quality: 85 })
      .toFile(gallery1);

    await sharp(m.src)
      .resize(W, H, { fit: 'cover', position: 'centre' })
      .webp({ quality: 85 })
      .toFile(cardPath);

    console.log(`✓ ${m.slug}: 1.webp + card updated (${W}x${H})`);
  }
  console.log('\nAll done!');
})();
