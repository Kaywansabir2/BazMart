// backend/scripts/apply_step7_1_prices.js
const fs = require('fs');
const path = require('path');

const part1Path = path.join(__dirname, 'catalog_part1.js');
const part2Path = path.join(__dirname, 'catalog_part2.js');

let p1 = require('./catalog_part1.js');
let p2 = require('./catalog_part2.js');

function patchProduct(list, id, updates) {
  const prod = list.find(x => x.id === id);
  if (!prod) {
    console.error(`Product ${id} not found in list!`);
    return;
  }
  Object.assign(prod, updates);
  if (updates.disc === null || updates.disc === undefined) {
    delete prod.disc;
  }
  if (updates.pct === null || updates.pct === undefined) {
    delete prod.pct;
  }
  console.log(`Patched ${id}: ${prod.en} -> price: ${prod.price}, disc: ${prod.disc ?? 'none'}`);
}

// 1. Al Rahma Low Fat Milk, 1L -> IQD 2250 (No discount, Stored at 5°, Brand: Al Rahma)
patchProduct(p1, 'p-alrahma', {
  en: 'Al Rahma Low Fat Milk, 1L',
  temp: 'Stored at 5°',
  brand: 'b-alrahma',
  price: 2250,
  disc: null,
  pct: null,
});

// 2. Ramak Full Fat Milk, 3%Fat -> IQD 2250
patchProduct(p1, 'p-ramak', {
  en: 'Ramak Full Fat Milk, 3%Fat',
  price: 2250,
  disc: null,
  pct: null,
});

// 3. White Eggs, 15 Pieces -> IQD 3750
patchProduct(p1, 'p-eggs', {
  en: 'White Eggs, 15 Pieces',
  price: 3750,
  disc: null,
  pct: null,
});

// 4. Almarai Full Fat Long Life Milk, 1L -> IQD 2750
patchProduct(p1, 'p-almarai-uht-1l', {
  en: 'Almarai Full Fat Long Life Milk, 1L',
  price: 2750,
  disc: null,
  pct: null,
});

// 5. Cucumber - Local, 1kg -> IQD 1445 (Original: IQD 1700, Save 15%)
patchProduct(p1, 'p-cucumber', {
  en: 'Cucumber - Local, 1kg',
  price: 1700,
  disc: 1445,
  pct: 15,
});

// 6. Piano Soft Ink Red Pen Valuable, 1 Piece -> IQD 400 (Original: IQD 500, Save 20%)
patchProduct(p2, 'p-bic-pen-red', {
  en: 'Piano Soft Ink Red Pen Valuable, 1 Piece',
  price: 500,
  disc: 400,
  pct: 20,
});

// 7. Mountain Dew Bottle, 300ml -> IQD 287 (Original: IQD 350, Save 18%)
patchProduct(p1, 'p-mountain-dew', {
  en: 'Mountain Dew Bottle, 300ml',
  unit: '300 ml',
  price: 350,
  disc: 287,
  pct: 18,
});

// 8. Schauma Strength & Vitality Shampoo -> IQD 7013 (Original: IQD 8250, Save 15%)
patchProduct(p2, 'p-shampoo', {
  en: 'Schauma Strength & Vitality Shampoo',
  price: 8250,
  disc: 7013,
  pct: 15,
});

// 9. Tabasco Ramen Noodles (Hot & Spicy / Savory Beef / Spicy Curry) -> IQD 1215 (Original: IQD 1350, Save 10%)
patchProduct(p2, 'p-tabasco-chicken', {
  en: 'Tabasco Ramen Noodles (Hot & Spicy), 70g',
  price: 1350,
  disc: 1215,
  pct: 10,
});
patchProduct(p2, 'p-tabasco-beef', {
  en: 'Tabasco Ramen Noodles (Savory Beef), 70g',
  price: 1350,
  disc: 1215,
  pct: 10,
});
patchProduct(p2, 'p-tabasco-curry', {
  en: 'Tabasco Ramen Noodles (Spicy Curry), 70g',
  price: 1350,
  disc: 1215,
  pct: 10,
});

// 10. Nescafe Iced Coffee (Latte / Cappuccino / Spanish Latte), 220ml -> IQD 1000
patchProduct(p1, 'p-nescafe-latte', {
  en: 'Nescafe Iced Coffee (Latte), 220ml',
  price: 1000,
  disc: null,
  pct: null,
});
patchProduct(p1, 'p-nescafe-caramel', {
  en: 'Nescafe Iced Coffee (Spanish Latte), 220ml',
  price: 1000,
  disc: null,
  pct: null,
});
patchProduct(p1, 'p-nescafe-cappuccino-can', {
  en: 'Nescafe Iced Coffee (Cappuccino), 220ml',
  price: 1000,
  disc: null,
  pct: null,
});

// 11. Exotic Coconut Milk, 400ml -> IQD 5250
patchProduct(p1, 'p-coconut-milk', {
  en: 'Exotic Coconut Milk, 400ml',
  price: 5250,
  disc: null,
  pct: null,
});

// 12. Rabbit Lollipop, 60g -> IQD 1250
patchProduct(p1, 'p-rabbit-lollipop', {
  en: 'Rabbit Lollipop, 60g',
  price: 1250,
  disc: null,
  pct: null,
});

// 13. My Chewy Coconut Flavor Candy -> IQD 6000
patchProduct(p1, 'p-chewy-candy', {
  en: 'My Chewy Coconut Flavor Candy',
  price: 6000,
  disc: null,
  pct: null,
});

// Write updated catalog parts
fs.writeFileSync(part1Path, 'module.exports = ' + JSON.stringify(p1, null, 2) + ';\n');
fs.writeFileSync(part2Path, 'module.exports = ' + JSON.stringify(p2, null, 2) + ';\n');

console.log('Successfully updated catalog_part1.js and catalog_part2.js with Step 7.1 exact pricing!');

