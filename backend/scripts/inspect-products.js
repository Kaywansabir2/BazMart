const fs = require('fs');

const seedContent = fs.readFileSync('c:/Users/zakar/BazMart/backend/prisma/seed.ts', 'utf8');

// Find all products defined in seed.ts
const pMatch = seedContent.match(/const products = \[([\s\S]*?)\];\s*\/\/ 6\./);
if (!pMatch) {
    console.log('Could not find products array in seed.ts');
} else {
    try {
        const productsArr = eval('[' + pMatch[1] + ']');
        console.log('Parsed products from seed.ts:', productsArr.length);
        
        // Group by categoryId
        const byCat = {};
        for (const p of productsArr) {
            byCat[p.categoryId] = (byCat[p.categoryId] || 0) + 1;
        }
        console.log('Products per category in seed.ts:', byCat);

        // Check the first 25 products
        console.log('\nFirst 25 products:');
        for (let i = 0; i < Math.min(25, productsArr.length); i++) {
            const p = productsArr[i];
            console.log(`[${i+1}] ${p.id} | ${p.externalErpId} | ${p.titleEn} | ${p.originalPriceIqd} IQD (Disc: ${p.discountedPriceIqd || 'N/A'}) | Cat: ${p.categoryId}`);
        }
    } catch (e) {
        console.error('Error parsing products:', e);
    }
}
