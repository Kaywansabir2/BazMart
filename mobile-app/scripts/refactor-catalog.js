const fs = require('fs');

const path = 'c:/Users/zakar/BazMart/mobile-app/lib/core/data/mock_erp_catalog.dart';
const content = fs.readFileSync(path, 'utf8');

const startMarker = '  // Master Catalog: All 400 SKUs (20 categories x 20 items)\n  static final List<ProductModel> allProducts = [\n';
const endMarker = '\n  ];\n\n  // Curated Subsections for Home Screen Display';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find markers!', { startIndex, endIndex });
  process.exit(1);
}

const before = content.substring(0, startIndex);
const after = content.substring(endIndex + '\n  ];\n'.length);

const productsBlock = content.substring(startIndex + startMarker.length, endIndex);
const items = productsBlock.split(/const ProductModel\(/g).filter(s => s.trim().length > 0);

console.log('Total products:', items.length);

const catNames = [
  'FruitVeg', 'Bakery', 'Meat', 'Frozen', 'Dairy',
  'Beverages', 'Snacks', 'Coffee', 'Milk', 'Breakfast',
  'Ready', 'Cooking', 'Icecream', 'Spices', 'Personal',
  'Household', 'Baby', 'Pet', 'Water', 'Stationery'
];

let generatedCode = '  // Master Catalog: 400 SKUs broken down by category for parser scalability\n';
const listNames = [];

for (let c = 0; c < 20; c++) {
  const cName = `_cat${catNames[c]}`;
  listNames.push(cName);
  const catItems = items.slice(c * 20, (c + 1) * 20);
  
  generatedCode += `  static const List<ProductModel> ${cName} = [\n`;
  for (const item of catItems) {
    let cleanItem = item.trim();
    if (cleanItem.endsWith(',')) cleanItem = cleanItem.substring(0, cleanItem.length - 1);
    generatedCode += `    const ProductModel(\n      ${cleanItem},\n`;
  }
  generatedCode += `  ];\n\n`;
}

generatedCode += `  static final List<ProductModel> allProducts = [\n`;
for (const lName of listNames) {
  generatedCode += `    ...${lName},\n`;
}
generatedCode += `  ];\n`;

const finalContent = before + generatedCode + after;
fs.writeFileSync(path, finalContent, 'utf8');
console.log('Successfully refactored mock_erp_catalog.dart into 20 sub-lists!');
