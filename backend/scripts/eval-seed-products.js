const fs = require('fs');

const seedPath = 'c:/Users/zakar/BazMart/backend/prisma/seed.ts';
const content = fs.readFileSync(seedPath, 'utf8');

const pStart = content.indexOf('const products = [');
const pEnd = content.indexOf('];', pStart);

console.log('pStart:', pStart, 'pEnd:', pEnd);

// Let's test evaluating the products array in a sandbox or function
const productsCode = content.substring(pStart + 'const products = ['.length, pEnd);
const products = eval('[' + productsCode + ']');
console.log('Total products currently in seed.ts:', products.length);

// Count per category
const counts = {};
products.forEach(p => {
    counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
});
console.log('Category counts:', counts);
