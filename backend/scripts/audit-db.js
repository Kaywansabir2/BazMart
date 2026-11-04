const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('=== PRISMA LIVE DATABASE AUDIT ===');
    
    // 1. Categories
    const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
    console.log('TOTAL_CATEGORIES:', categories.length);
    for (const c of categories) {
        const pCount = await prisma.product.count({ where: { categoryId: c.id } });
        console.log(`CAT: [${c.slug}] "${c.nameEn}" | "${c.nameCkb}" | "${c.nameAr}" => ${pCount} products`);
    }

    // 2. Total Products
    const totalProducts = await prisma.product.count();
    console.log('TOTAL_PRODUCTS:', totalProducts);

    // 3. Warehouses
    const warehouses = await prisma.warehouse.findMany();
    console.log('TOTAL_WAREHOUSES:', warehouses.length);
    for (const w of warehouses) {
        console.log(`WH: [${w.id}] ${w.name} in ${w.city} | Lat: ${w.latitude}, Lng: ${w.longitude} | Radius: ${w.deliveryRadiusKm}km | MinOrder: ${w.minOrderIqd} IQD`);
    }

    // 4. Drivers
    const drivers = await prisma.driver.findMany();
    console.log('TOTAL_DRIVERS:', drivers.length);
    for (const d of drivers) {
        console.log(`DRIVER: ${d.fullName} (${d.phone}) | ${d.vehicleType} | Plate: ${d.plateNumber} | Rating: ${d.averageRating} (${d.totalRatingsCount}) | Cash: ${d.cashInHandIqd} IQD`);
    }

    // 5. Coupons
    const coupons = await prisma.coupon.findMany();
    console.log('TOTAL_COUPONS:', coupons.length);
    for (const cp of coupons) {
        console.log(`COUPON: "${cp.code}" | Type: ${cp.discountType} | Val: ${cp.discountValue} | MinSubtotal: ${cp.minOrderSubtotalIqd} IQD | MaxCap: ${cp.maxDiscountIqd} IQD | FirstOrderOnly: ${cp.firstOrderOnly} | ExcludeDiscounted: ${cp.excludeDiscountedItems} | Active: ${cp.isActive}`);
    }

    // 6. Customers
    const customers = await prisma.customer.findMany({ include: { addresses: true } });
    console.log('TOTAL_CUSTOMERS:', customers.length);
    for (const cust of customers) {
        console.log(`CUSTOMER: ${cust.name} (${cust.phone}) | Lang: ${cust.preferredLanguage} | Addresses: ${cust.addresses.length}`);
        for (const a of cust.addresses) {
            console.log(`  ADDR: [${a.title}] ${a.city}, ${a.neighborhood}, ${a.street}, ${a.building} (Default: ${a.isDefault})`);
        }
    }

    // 7. Other Counts
    const brandsCount = await prisma.brand.count();
    const countriesCount = await prisma.countryOrigin.count();
    const bannersCount = await prisma.campaignBanner.count();
    const ordersCount = await prisma.order.count();
    const orderItemsCount = await prisma.orderItem.count();
    const ratingsCount = await prisma.orderRating.count();
    const notifsCount = await prisma.notification.count();
    const stocksCount = await prisma.warehouseStock.count();
    const redemptionsCount = await prisma.couponRedemption.count();

    console.log('TOTAL_BRANDS:', brandsCount);
    console.log('TOTAL_COUNTRIES:', countriesCount);
    console.log('TOTAL_CAMPAIGN_BANNERS:', bannersCount);
    console.log('TOTAL_ORDERS:', ordersCount);
    console.log('TOTAL_ORDER_ITEMS:', orderItemsCount);
    console.log('TOTAL_RATINGS:', ratingsCount);
    console.log('TOTAL_NOTIFICATIONS:', notifsCount);
    console.log('TOTAL_STOCKS:', stocksCount);
    console.log('TOTAL_COUPON_REDEMPTIONS:', redemptionsCount);

    // 8. Core Reference Products
    console.log('\n--- CORE TALABAT MART REFERENCE ITEMS AUDIT ---');
    const queries = ['Milk', 'Pepper', 'Coffee', 'Egg', 'Cucumber', 'Pen', 'Mountain Dew', 'Schauma', 'Ramen', 'Lollipop', 'Shallot', 'Grapefruit'];
    for (const q of queries) {
        const found = await prisma.product.findMany({
            where: {
                OR: [
                    { titleEn: { contains: q } },
                    { externalErpId: { contains: q.toLowerCase() } }
                ]
            }
        });
        for (const item of found) {
            console.log(`MATCH [${q}]: "${item.titleEn}" | ERP: ${item.externalErpId} | Orig: ${item.originalPriceIqd} IQD | Disc: ${item.discountedPriceIqd || 'N/A'} IQD | Pct: ${item.discountPercentage || 0}% | Storage: ${item.storageTemp}`);
        }
    }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
