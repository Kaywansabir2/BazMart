const p1 = require('./catalog_part1.js');
const p2 = require('./catalog_part2.js');
const all = [...p1, ...p2];
console.log('Total SKUs:', all.length);

// 1. Categories
const cats = {};
all.forEach(p => {
  if (!cats[p.cat]) cats[p.cat] = { count: 0, disc: 0, catEn: p.catEn };
  cats[p.cat].count++;
  if (p.disc) cats[p.cat].disc++;
});
console.log('Category Counts & Discounts:');
let allCatsValid = true;
Object.entries(cats).forEach(([cat, data]) => {
  const pct = Math.round((data.disc / data.count) * 100);
  console.log(` - ${cat} (${data.catEn}): ${data.count} items, ${data.disc} discounted (${pct}%)`);
  if (data.count !== 20 || pct < 30) allCatsValid = false;
});
console.log('Categories Valid (20 items, >=30% disc):', allCatsValid);

// 2. Uniqueness
const ids = new Set();
const skus = new Set();
const bars = new Set();
let duplicates = 0;
all.forEach(p => {
  if (ids.has(p.id)) { console.log('Dup ID:', p.id); duplicates++; }
  if (skus.has(p.erp)) { console.log('Dup SKU:', p.erp); duplicates++; }
  if (bars.has(p.bar)) { console.log('Dup Barcode:', p.bar); duplicates++; }
  ids.add(p.id);
  skus.add(p.erp);
  bars.add(p.bar);
});
console.log('Total duplicates found:', duplicates);

// 3. Countries
const coCounts = {};
all.forEach(p => coCounts[p.co] = (coCounts[p.co] || 0) + 1);
console.log('Country counts:', coCounts);

// 4. Brands
const brandCounts = {};
all.forEach(p => brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1);
console.log('Brand counts:', Object.keys(brandCounts).length, 'brands:', Object.keys(brandCounts));

