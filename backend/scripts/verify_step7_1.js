const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const ids = [
    'p-alrahma', 'p-ramak', 'p-eggs', 'p-almarai-uht-1l', 'p-cucumber',
    'p-bic-pen-red', 'p-mountain-dew', 'p-shampoo', 'p-tabasco-chicken',
    'p-nescafe-latte', 'p-coconut-milk', 'p-rabbit-lollipop', 'p-chewy-candy'
  ];
  const items = await prisma.product.findMany({ where: { id: { in: ids } } });
  for (const i of items) {
    console.log(`${i.id.padEnd(20)} | ${i.titleEn.padEnd(45)} | Price: ${String(i.originalPriceIqd).padStart(5)} | Disc: ${String(i.discountedPriceIqd ?? 'none').padStart(5)}`);
  }
  const count = await prisma.product.count();
  console.log('Total Products in DB:', count);
  const coupons = await prisma.coupon.findMany();
  console.log('Total Coupons in DB:', coupons.length);
  for (const c of coupons) {
    console.log(`- Coupon: ${c.code.padEnd(12)} | Min: ${c.minOrderSubtotalIqd} | ExcludeDisc: ${c.excludeDiscountedItems} | Cats: ${c.applicableCategoryIds}`);
  }
  await prisma.$disconnect();
}

check();

