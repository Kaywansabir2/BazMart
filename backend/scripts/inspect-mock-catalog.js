const fs = require('fs');
const content = fs.readFileSync('c:/Users/zakar/BazMart/mobile-app/lib/core/data/mock_erp_catalog.dart', 'utf8');

const targets = [
  'p-alrahma',
  'p-ramak',
  'p-eggs',
  'p-almarai',
  'p-cucumber',
  'p-pen',
  'p-mountain-dew',
  'p-schauma',
  'p-shallot',
  'p-grapefruit',
  'p-pepper-color',
  'p-tabasco-chicken',
  'p-tabasco-beef',
  'p-tabasco-curry',
  'p-nescafe-latte',
  'p-nescafe-cappuccino',
  'p-nescafe-spanish',
  'p-coconut-milk',
  'p-lollipop',
  'p-my-chewy'
];

for (const t of targets) {
  const needle = `id: '${t}'`;
  const idx = content.indexOf(needle);
  if (idx !== -1) {
    const snippet = content.substring(idx, idx + 450);
    const lines = snippet.split('\n').slice(0, 10).map(l => l.trim()).join(' | ');
    console.log(`FOUND: ${lines}`);
  } else {
    console.log(`NOT FOUND: ${t}`);
  }
}
