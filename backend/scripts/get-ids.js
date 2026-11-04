const fs = require('fs');

const mockContent = fs.readFileSync('c:/Users/zakar/BazMart/mobile-app/lib/core/data/mock_erp_catalog.dart', 'utf8');

const titles = [
  'Almarai Full Fat Long Life Milk, 1L',
  'Schauma Strength & Vitality Shampoo',
  'Nescafe Iced Coffee (Cappuccino)',
  'Nescafe Iced Coffee (Spanish Latte)',
  'Rabbit Lollipop',
  'My Chewy Coconut',
  'Piano Soft Ink Red Pen',
  'Pepper Long Color',
  'Shallot - Iran',
  'Grapefruit Yellow - Turkey'
];

for (const t of titles) {
    const idx = mockContent.indexOf(t);
    if (idx !== -1) {
        // find preceding 'id:'
        const prevIdIdx = mockContent.lastIndexOf('id:', idx);
        const snippet = mockContent.substring(prevIdIdx, prevIdIdx + 300);
        console.log(`MATCH [${t}]:\n${snippet.split('\n').slice(0, 7).join('\n')}\n`);
    } else {
        console.log(`NOT FOUND: ${t}`);
    }
}
