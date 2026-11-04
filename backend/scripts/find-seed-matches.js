const fs = require('fs');

const seedPath = 'c:/Users/zakar/BazMart/backend/prisma/seed.ts';
const content = fs.readFileSync(seedPath, 'utf8');

const pStart = content.indexOf('const products = [');
const pEnd = content.indexOf('];', pStart);
const products = eval('[' + content.substring(pStart + 'const products = ['.length, pEnd) + ']');

const queries = [
  'Al Rahma',
  'Ramak',
  'White Eggs',
  'Almarai',
  'Cucumber',
  'Piano',
  'Mountain Dew',
  'Schauma',
  'Shallot',
  'Grapefruit',
  'Pepper',
  'Tabasco',
  'Iced',
  'Coconut Milk',
  'Lollipop',
  'Chewy'
];

for (const q of queries) {
    const found = products.filter(p => p.titleEn.toLowerCase().includes(q.toLowerCase()) || p.id.includes(q.toLowerCase()));
    console.log(`=== Query [${q}]: ${found.length} items ===`);
    for (const f of found) {
        console.log(`  id: "${f.id}", externalErpId: "${f.externalErpId}", titleEn: "${f.titleEn}", original: ${f.originalPriceIqd}, disc: ${f.discountedPriceIqd}, cat: "${f.categoryId}"`);
    }
}
