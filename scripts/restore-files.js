const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repo = 'F:\\Verde Wep\\verde-web';
const commit = '097f589';

const files = [
  'app/components/ProductsSection.tsx',
  'app/components/ProductsSection.module.css',
  'app/products/[slug]/ProductPageClient.tsx',
  'app/products/[slug]/ProductPage.module.css',
];

for (const file of files) {
  const content = execSync(`git -C "${repo}" show ${commit}:${file}`, { maxBuffer: 10 * 1024 * 1024 });
  const dest = path.join(repo, file.replace(/\//g, '\\'));
  fs.writeFileSync(dest, content); // raw Buffer, no encoding conversion
  console.log('Restored:', file);
}

console.log('All done!');
