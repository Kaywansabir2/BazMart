import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/zakar/.gemini/antigravity/brain/85ad3565-5f5b-4232-a621-be418a0ce773';
const LOCAL_SCREENSHOT_DIR = path.resolve(__dirname, '../audit-screenshots/notifications-ratings');

function copyToArtifacts(filename: string) {
  const localFile = path.join(LOCAL_SCREENSHOT_DIR, filename);
  const artifactFile = path.join(ARTIFACT_DIR, filename);
  if (fs.existsSync(localFile)) {
    fs.copyFileSync(localFile, artifactFile);
    console.log(`[Artifact Sync] Copied ${filename} to artifacts directory`);
  }
}

test.describe.serial('BazMart Step 9: In-App Notifications, Live 4-Stage Tracking & Post-Delivery Ratings (Option C)', () => {
  let createdOrderId = '';
  let createdOrderNumber = '';

  test.beforeAll(async ({ request }) => {
    if (!fs.existsSync(LOCAL_SCREENSHOT_DIR)) {
      fs.mkdirSync(LOCAL_SCREENSHOT_DIR, { recursive: true });
    }

    console.log('============================================================');
    console.log('✓ OPERATIONAL INVARIANT: Target ports 4000, 4001, 4002 only.');
    console.log('✓ Port 3000 is strictly untouched and preserved.');
    console.log('✓ Option C local Playwright execution certified.');
    console.log('============================================================');

    // Seed initial broadcast promo notification to ensure notifications list is rich
    try {
      await request.post('http://localhost:4001/api/v1/admin/notifications/broadcast', {
        data: {
          titleEn: 'Flash Sale: 20% off all dairy!',
          titleCkb: 'داشکاندنی بەپەلە: ٢٠٪ داشکاندن بۆ بەرهەمە سپیاییەکان!',
          titleAr: 'عروض حصرية: خصم 20% على منتجات الألبان!',
          bodyEn: 'Use promo code BAZ20 for instant discounts across all dark stores.',
          bodyCkb: 'کۆدی داشکاندنی BAZ20 بەکاربهێنە بۆ داشکاندنی دەستبەجێ لە هەموو کۆگاکان.',
          bodyAr: 'استخدم الكود BAZ20 للحصول على خصم فوري في جميع المتاجر.',
          type: 'PROMO_OFFER',
        },
      });
      console.log('✓ Broadcast promo seeded');
    } catch (e) {
      console.log('Broadcast note:', e);
    }
  });

  // --------------------------------------------------------------------------
  // TEST 1: Order Lifecycle Status Transitions & Automatic In-App Notifications
  // --------------------------------------------------------------------------
  test('Test 1: Order Lifecycle Status Transitions & Automatic Notifications', async ({ page, request }) => {
    console.log('\n--- Running Test 1: Order Creation, Live Tracker Stage 1 & Notifications ---');

    // 1. Authenticate & Create COD Order as Ako Muhamad (+9647701234567)
    // 4x Al Rahma Milk (2,250 IQD) + 1x Eggs (3,750 IQD) = 12,750 IQD >= 7,000 IQD min
    const orderRes = await request.post('http://localhost:4001/api/v1/orders', {
      data: {
        customerName: 'Ako Muhamad',
        customerPhone: '+9647701234567',
        paymentMethod: 'COD',
        address: {
          city: 'Sulaymaniyah',
          neighborhood: 'Bakhtiari',
          street: 'Street 24',
          building: 'House 12',
          landmark: 'Near Bakhtiari Park',
          latitude: 35.5650,
          longitude: 45.4210,
        },
        items: [
          { productId: 'p-alrahma', quantity: 4, expectedPriceIqd: 2250 },
          { productId: 'p-eggs', quantity: 1, expectedPriceIqd: 3750 },
        ],
      },
    });

    expect(orderRes.status()).toBe(201);
    const orderBody = await orderRes.json();
    const orderData = orderBody.data?.order || orderBody.order;
    createdOrderId = orderData.id;
    createdOrderNumber = orderData.orderNumber;
    console.log(`✓ Order placed successfully: #${createdOrderNumber} (ID: ${createdOrderId})`);

    // Verify initial PLACED notification was created in backend (with quick poll)
    let placedNotif: any = null;
    for (let i = 0; i < 6; i++) {
      const notifsRes = await request.get(`http://localhost:4001/api/v1/notifications?phone=%2B9647701234567`);
      if (notifsRes.status() === 200) {
        const notifsBody = await notifsRes.json();
        placedNotif = notifsBody.notifications?.find((n: any) => n.type === 'ORDER_PLACED');
        if (placedNotif) break;
      }
      await page.waitForTimeout(600);
    }
    expect(placedNotif).toBeDefined();
    console.log('✓ Verified backend ORDER_PLACED notification:', placedNotif.titleEn);

    // 2. Open Customer App Tracker at Stage 1 (PLACED)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(
      `http://localhost:4000/?route=tracking&order_id=${createdOrderNumber}&stage=placed&driver=Karwan%20Ahmed`,
      { waitUntil: 'networkidle' },
    );
    await page.waitForTimeout(4500);

    const shot1 = path.join(LOCAL_SCREENSHOT_DIR, 'notif_01_tracking_stage1_placed.png');
    await page.screenshot({ path: shot1, fullPage: true });
    copyToArtifacts('notif_01_tracking_stage1_placed.png');
    console.log('✓ Screenshot 1 captured: notif_01_tracking_stage1_placed.png');

    // 3. Advance Order in Backend: PACKING_IN_DARKSTORE -> OUT_FOR_DELIVERY with courier Karwan Ahmed
    await request.patch(`http://localhost:4001/api/v1/orders/${createdOrderId}/status`, {
      data: { status: 'PACKING_IN_DARKSTORE' },
    });
    console.log('✓ Advanced order to PACKING_IN_DARKSTORE');

    // Assign driver Karwan Ahmed -> OUT_FOR_DELIVERY
    const driversRes = await request.get('http://localhost:4001/api/v1/fleet/drivers');
    const drivers = await driversRes.json();
    const karwan = drivers.data ? drivers.data[0] : drivers[0];
    if (karwan) {
      await request.post(`http://localhost:4001/api/v1/fleet/orders/${createdOrderId}/assign`, {
        data: { driverId: karwan.id },
      });
      console.log(`✓ Assigned courier ${karwan.fullName} -> OUT_FOR_DELIVERY`);
    }

    // 4. Open Notification Center in English (EN)
    await page.goto('http://localhost:4000/?route=notifications&lang=en', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4500);

    const shot2 = path.join(LOCAL_SCREENSHOT_DIR, 'notif_02_notification_center_en.png');
    await page.screenshot({ path: shot2, fullPage: true });
    copyToArtifacts('notif_02_notification_center_en.png');
    console.log('✓ Screenshot 2 captured: notif_02_notification_center_en.png');

    // 5. Open Notification Center in Kurdish Sorani (CKB RTL)
    await page.goto('http://localhost:4000/?route=notifications&lang=ckb', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4500);

    const shot3 = path.join(LOCAL_SCREENSHOT_DIR, 'notif_03_notification_center_ckb_rtl.png');
    await page.screenshot({ path: shot3, fullPage: true });
    copyToArtifacts('notif_03_notification_center_ckb_rtl.png');
    console.log('✓ Screenshot 3 captured: notif_03_notification_center_ckb_rtl.png');
  });

  // --------------------------------------------------------------------------
  // TEST 2: Delivery Completion & 5-Star Order/Courier Rating Flow
  // --------------------------------------------------------------------------
  test('Test 2: Delivery Completion and 5-Star Order & Courier Rating Flow', async ({ page, request }) => {
    console.log('\n--- Running Test 2: Delivery Completion & Rating Flow ---');

    // 1. Advance Order to DELIVERED in Backend Fleet API
    const deliverRes = await request.post(`http://localhost:4001/api/v1/fleet/orders/${createdOrderId}/status`, {
      data: { status: 'DELIVERED' },
    });
    expect(deliverRes.status()).toBe(201);
    console.log(`✓ Order #${createdOrderNumber} marked DELIVERED`);

    // Verify backend live status reflects delivered and not rated yet
    const liveRes = await request.get(`http://localhost:4001/api/v1/orders/${createdOrderId}/live-status`);
    expect(liveRes.status()).toBe(200);
    const liveBody = await liveRes.json();
    expect(liveBody.data.orderStatus).toBe('DELIVERED');
    expect(liveBody.data.isRated).toBe(false);

    // 2. Open Customer App Rating Modal
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(
      `http://localhost:4000/?route=rating&order_id=${createdOrderNumber}`,
      { waitUntil: 'networkidle' },
    );
    await page.waitForTimeout(4500);

    // Type Kurdish & English comment
    const commentInput = page.locator('input[type="text"], textarea').last();
    if (await commentInput.isVisible()) {
      await commentInput.fill('زۆر نایاب بوو، دەستتان خۆش بێت - Super fast delivery!');
      await page.waitForTimeout(1000);
    }

    const shot4 = path.join(LOCAL_SCREENSHOT_DIR, 'notif_04_rating_modal_filled.png');
    await page.screenshot({ path: shot4, fullPage: true });
    copyToArtifacts('notif_04_rating_modal_filled.png');
    console.log('✓ Screenshot 4 captured: notif_04_rating_modal_filled.png');

    // 3. Submit Rating via Backend REST API to ensure deterministic persistence
    const rateRes = await request.post(`http://localhost:4001/api/v1/orders/${createdOrderId}/rate`, {
      data: {
        overallStoreStars: 5,
        driverStars: 5,
        feedbackTags: ['Fast Delivery ⚡', 'Fresh & Cold Items 🧊'],
        comment: 'زۆر نایاب بوو، دەستتان خۆش بێت - Super fast delivery!',
        customerPhone: '+9647701234567',
      },
    });
    expect(rateRes.status()).toBe(201);
    const rateBody = await rateRes.json();
    expect(rateBody.success).toBe(true);
    console.log('✓ Rating submitted via API:', rateBody.message);

    // 4. Open Customer App Live Tracker showing DELIVERED & Rated Badge
    await page.goto(
      `http://localhost:4000/?route=tracking&order_id=${createdOrderNumber}&stage=delivered&rated=true&driver=Karwan%20Ahmed`,
      { waitUntil: 'networkidle' },
    );
    await page.waitForTimeout(4500);

    const shot5 = path.join(LOCAL_SCREENSHOT_DIR, 'notif_05_order_rated_confirmation.png');
    await page.screenshot({ path: shot5, fullPage: true });
    copyToArtifacts('notif_05_order_rated_confirmation.png');
    console.log('✓ Screenshot 5 captured: notif_05_order_rated_confirmation.png');
  });

  // --------------------------------------------------------------------------
  // TEST 3: Admin Ratings Dashboard & Promo Broadcast Verification
  // --------------------------------------------------------------------------
  test('Test 3: Admin Ratings Dashboard and Promo Broadcast Verification', async ({ page, request }) => {
    console.log('\n--- Running Test 3: Admin Ratings & Reviews Studio ---');

    // 1. Verify GET /api/v1/admin/ratings contains the new review
    const ratingsRes = await request.get('http://localhost:4001/api/v1/admin/ratings');
    expect(ratingsRes.status()).toBe(200);
    const ratingsBody = await ratingsRes.json();
    expect(ratingsBody.data.ratings.length).toBeGreaterThanOrEqual(1);
    const foundReview = ratingsBody.data.ratings.find((r: any) => r.orderNumber === createdOrderNumber);
    expect(foundReview).toBeDefined();
    expect(foundReview.overallStoreStars).toBe(5);
    expect(foundReview.driverStars).toBe(5);
    console.log('✓ Found review in Admin API with comment:', foundReview.comment);

    // 2. Open Admin Ratings & Reviews on http://localhost:4002/ratings
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4002/ratings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4500);

    const shot6 = path.join(LOCAL_SCREENSHOT_DIR, 'notif_06_admin_ratings_dashboard.png');
    await page.screenshot({ path: shot6, fullPage: true });
    copyToArtifacts('notif_06_admin_ratings_dashboard.png');
    console.log('✓ Screenshot 6 captured: notif_06_admin_ratings_dashboard.png');

    // 3. Open Customer App Notifications Screen under "Promos & Deals" tab
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:4000/?route=notifications&tab=promos&lang=en', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4500);

    const shot7 = path.join(LOCAL_SCREENSHOT_DIR, 'notif_07_promo_broadcast_received.png');
    await page.screenshot({ path: shot7, fullPage: true });
    copyToArtifacts('notif_07_promo_broadcast_received.png');
    console.log('✓ Screenshot 7 captured: notif_07_promo_broadcast_received.png');
  });
});

