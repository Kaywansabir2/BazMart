import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Demo Customer: Ako Muhamad (+9647701234567)...');

  // 1. Upsert Customer
  const customer = await prisma.customer.upsert({
    where: { phone: '+9647701234567' },
    update: {
      name: 'Ako Muhamad',
      preferredLanguage: 'en',
    },
    create: {
      phone: '+9647701234567',
      name: 'Ako Muhamad',
      preferredLanguage: 'en',
    },
  });

  console.log(`Customer ID: ${customer.id}`);

  // 2. Clear old demo addresses and seed clean addresses
  await prisma.customerAddress.deleteMany({
    where: { customerId: customer.id },
  });

  const address1 = await prisma.customerAddress.create({
    data: {
      customerId: customer.id,
      title: 'Home',
      city: 'Sulaymaniyah',
      neighborhood: 'Bakhtiari',
      street: 'Street 24',
      building: 'House 12',
      landmark: 'Near Bakhtiari Park',
      latitude: 35.5669,
      longitude: 45.4144,
      isDefault: true,
    },
  });

  const address2 = await prisma.customerAddress.create({
    data: {
      customerId: customer.id,
      title: 'Office',
      city: 'Erbil',
      neighborhood: 'Empire World',
      street: 'Main Blvd',
      building: 'Building B4',
      landmark: 'Next to Royal Tower',
      latitude: 36.1972,
      longitude: 43.9632,
      isDefault: false,
    },
  });

  console.log('Seeded 2 addresses (Home Suly [default], Office Erbil)');

  // 3. Find Core Reference Products
  const products = await prisma.product.findMany({
    where: {
      id: { in: ['p-alrahma', 'p-ramak', 'p-eggs', 'p-coconut-milk'] },
    },
  });

  const prodMap = new Map(products.map((p) => [p.id, p]));
  const pAlRahma = prodMap.get('p-alrahma') || products[0];
  const pRamak = prodMap.get('p-ramak') || products[1];
  const pEggs = prodMap.get('p-eggs') || products[2];
  const pCoconut = prodMap.get('p-coconut-milk') || products[3];

  const warehouse = (await prisma.warehouse.findFirst({
    where: { city: { contains: 'Sulaymaniyah' } },
  })) || (await prisma.warehouse.findFirst())!;

  // 4. Clean old seed orders for this demo customer
  await prisma.order.deleteMany({
    where: {
      orderNumber: { in: ['BM-8001', 'BM-8002'] },
    },
  });

  // Order 1: BM-8001 (Al Rahma + Ramak + Eggs)
  const priceAlRahma = pAlRahma.discountedPriceIqd ?? pAlRahma.originalPriceIqd;
  const priceRamak = pRamak.discountedPriceIqd ?? pRamak.originalPriceIqd;
  const priceEggs = pEggs.discountedPriceIqd ?? pEggs.originalPriceIqd;
  const subtotal1 = priceAlRahma * 2 + priceRamak * 1 + priceEggs * 2;

  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'BM-8001',
      customerId: customer.id,
      warehouseId: warehouse.id,
      addressSnapshot: JSON.stringify({
        title: address1.title,
        city: address1.city,
        neighborhood: address1.neighborhood,
        street: address1.street,
        building: address1.building,
        landmark: address1.landmark,
      }),
      subtotalIqd: subtotal1,
      discountTotalIqd: 0,
      deliveryFeeIqd: 0,
      totalIqd: subtotal1,
      paymentMethod: 'COD',
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
      assignedDriverName: 'Karwan Ahmed',
      assignedDriverPhone: '+964 750 491 8822',
      isPacked: true,
      deliveredAt: new Date(Date.now() - 3 * 86400 * 1000), // 3 days ago
      createdAt: new Date(Date.now() - 3 * 86400 * 1000),
      items: {
        create: [
          {
            productId: pAlRahma.id,
            quantity: 2,
            unitPriceIqd: priceAlRahma,
            totalIqd: priceAlRahma * 2,
            isPacked: true,
          },
          {
            productId: pRamak.id,
            quantity: 1,
            unitPriceIqd: priceRamak,
            totalIqd: priceRamak * 1,
            isPacked: true,
          },
          {
            productId: pEggs.id,
            quantity: 2,
            unitPriceIqd: priceEggs,
            totalIqd: priceEggs * 2,
            isPacked: true,
          },
        ],
      },
    },
  });

  // Order 2: BM-8002 (Coconut Milk + Eggs)
  const priceCoconut = pCoconut.discountedPriceIqd ?? pCoconut.originalPriceIqd;
  const subtotal2 = priceCoconut * 2 + priceEggs * 1;

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'BM-8002',
      customerId: customer.id,
      warehouseId: warehouse.id,
      addressSnapshot: JSON.stringify({
        title: address1.title,
        city: address1.city,
        neighborhood: address1.neighborhood,
        street: address1.street,
      }),
      subtotalIqd: subtotal2,
      discountTotalIqd: 0,
      deliveryFeeIqd: 0,
      totalIqd: subtotal2,
      paymentMethod: 'FASTPAY',
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
      assignedDriverName: 'Dana Jalal',
      assignedDriverPhone: '+964 770 312 9988',
      isPacked: true,
      deliveredAt: new Date(Date.now() - 1 * 86400 * 1000), // yesterday
      createdAt: new Date(Date.now() - 1 * 86400 * 1000),
      items: {
        create: [
          {
            productId: pCoconut.id,
            quantity: 2,
            unitPriceIqd: priceCoconut,
            totalIqd: priceCoconut * 2,
            isPacked: true,
          },
          {
            productId: pEggs.id,
            quantity: 1,
            unitPriceIqd: priceEggs,
            totalIqd: priceEggs * 1,
            isPacked: true,
          },
        ],
      },
    },
  });

  console.log(`Seeded Order 1 (${order1.orderNumber}) and Order 2 (${order2.orderNumber}) for Ako Muhamad.`);
  console.log('Demo customer seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
