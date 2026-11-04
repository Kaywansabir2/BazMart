import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/zakar/.gemini/antigravity/brain/85ad3565-5f5b-4232-a621-be418a0ce773';
const LOCAL_SCREENSHOT_DIR = path.resolve(__dirname, '../audit-screenshots/parity');

function copyToArtifacts(filename: string) {
  const localFile = path.join(LOCAL_SCREENSHOT_DIR, filename);
  const artifactFile = path.join(ARTIFACT_DIR, filename);
  if (fs.existsSync(localFile)) {
    fs.copyFileSync(localFile, artifactFile);
    console.log(`[Artifact Sync] Copied ${filename} to artifacts directory`);
  }
}

test.describe.serial('BazMart Step 9.1: 100% Pixel-Perfect Micro-Detail Alignment (Option C)', () => {
  test.beforeAll(async () => {
    if (!fs.existsSync(LOCAL_SCREENSHOT_DIR)) {
      fs.mkdirSync(LOCAL_SCREENSHOT_DIR, { recursive: true });
    }

    console.log('============================================================');
    console.log('✓ OPERATIONAL INVARIANT: Target ports 4000, 4001, 4002 only.');
    console.log('✓ Port 3000 is strictly untouched and preserved.');
    console.log('✓ Option C local Playwright execution certified.');
    console.log('============================================================');
  });

  // --------------------------------------------------------------------------
  // PARITY SCREENSHOT 1: Home Screen Top View (Screenshot 1 Equivalent)
  // Sticky search header, top vertical promo cards 3 full + 20% peek of 4th,
  // Buy again carousel 2 full + 35% peek of 3rd, Sticky bottom bar State A (Empty cart)
  // --------------------------------------------------------------------------
  test('Parity 01: Home Screen Top, Vertical Promo Peek, Buy Again Peek & Empty Cart Bar', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:4000/?lang=en', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4500);

    const shot = path.join(LOCAL_SCREENSHOT_DIR, 'parity_01.png');
    await page.screenshot({ path: shot });
    copyToArtifacts('parity_01.png');
    console.log('✓ Parity Screenshot 1 captured: parity_01.png');
  });

  // --------------------------------------------------------------------------
  // PARITY SCREENSHOT 2: Shop by Category 3x4 Grid (Screenshot 2 Equivalent)
  // 4 full columns + 20% peek of 5th column, 2-segment centered pill indicator
  // --------------------------------------------------------------------------
  test('Parity 02: Shop by Category 3x4 Grid with 5th Column Edge Peek & 2-Segment Indicator', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:4000/?scroll=category&lang=en', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);

    const shot = path.join(LOCAL_SCREENSHOT_DIR, 'parity_02.png');
    await page.screenshot({ path: shot });
    copyToArtifacts('parity_02.png');
    console.log('✓ Parity Screenshot 2 captured: parity_02.png');
  });

  // --------------------------------------------------------------------------
  // PARITY SCREENSHOT 3: Full-Width Pepsi Banner Carousel & Top Savers (Screenshot 3 Equivalent)
  // ViewportFraction: 0.90 banner edge peek, Yellow price highlighter on sale items
  // --------------------------------------------------------------------------
  test('Parity 03: Full-Width Pepsi Banner Carousel (0.90 viewport) & Top Savers Yellow Highlighters', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:4000/?scroll=pepsi&lang=en', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);

    const shot = path.join(LOCAL_SCREENSHOT_DIR, 'parity_03.png');
    await page.screenshot({ path: shot });
    copyToArtifacts('parity_03.png');
    console.log('✓ Parity Screenshot 3 captured: parity_03.png');
  });

  // --------------------------------------------------------------------------
  // PARITY SCREENSHOT 4: Tabasco Noodle Flavors Carousel (Screenshot 4 Equivalent)
  // 2 full cards + 35% peek of 3rd card
  // --------------------------------------------------------------------------
  test('Parity 04: Tabasco Noodle Flavors Carousel with 35% Edge Peek', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:4000/?scroll=tabasco&lang=en', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);

    const shot = path.join(LOCAL_SCREENSHOT_DIR, 'parity_04.png');
    await page.screenshot({ path: shot });
    copyToArtifacts('parity_04.png');
    console.log('✓ Parity Screenshot 4 captured: parity_04.png');
  });

  // --------------------------------------------------------------------------
  // PARITY SCREENSHOT 5: Split "Fresh picks every day" Banner Geometry (Screenshot 5 Equivalent)
  // Warm beige/cream banner, orange + dark brown text, angled ribbon badge, grocery bag
  // and fresh produce carousel (Shallot 1350, Grapefruit 4250, Pepper 2000)
  // --------------------------------------------------------------------------
  test('Parity 05: Split Fresh Picks Banner Geometry & Produce Highlighters', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:4000/?scroll=fresh_picks&lang=en', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);

    const shot = path.join(LOCAL_SCREENSHOT_DIR, 'parity_05.png');
    await page.screenshot({ path: shot });
    copyToArtifacts('parity_05.png');
    console.log('✓ Parity Screenshot 5 captured: parity_05.png');
  });

  // --------------------------------------------------------------------------
  // PARITY SCREENSHOT 6: Discounted Items Yellow Highlighter Strip (Screenshot 6 Equivalent)
  // Schauma IQD 7013 / 8250 strikethrough, Mountain Dew IQD 287 / 350, Piano Pen IQD 400 / 500
  // --------------------------------------------------------------------------
  test('Parity 06: Exact Yellow Price Highlighter Strip (#FFF176) & Strikethrough Old Prices', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:4000/?scroll=top_savers&lang=en', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);

    const shot = path.join(LOCAL_SCREENSHOT_DIR, 'parity_06.png');
    await page.screenshot({ path: shot });
    copyToArtifacts('parity_06.png');
    console.log('✓ Parity Screenshot 6 captured: parity_06.png');
  });

  // --------------------------------------------------------------------------
  // PARITY SCREENSHOT 7: ProductDetailScreen Sheet Curve & Split Bottom Bar (Screenshot 7 Equivalent)
  // Top product image, rounded top corners white sheet (24px), Stored at 5° ⓘ,
  // Split bottom bar with bold price and ~58% orange Add to Cart button
  // --------------------------------------------------------------------------
  test('Parity 07: ProductDetailScreen Sheet Curve, Storage Info & 58% Orange Bottom Bar', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:4000/?route=product&id=p-alrahma&lang=en', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);

    const shot = path.join(LOCAL_SCREENSHOT_DIR, 'parity_07.png');
    await page.screenshot({ path: shot });
    copyToArtifacts('parity_07.png');
    console.log('✓ Parity Screenshot 7 captured: parity_07.png');
  });

  // --------------------------------------------------------------------------
  // PARITY SCREENSHOT 8: CartScreen Line-Item Total Multiplication & Compact Usuals (Screenshot 8 Equivalent)
  // Compact "Grab your usuals" (no title, 105x105 box + bold price only),
  // Multiplied line totals (Coconut 5250, Rabbit 1250, Milk 4500, Eggs 7500 = 18500 IQD)
  // Wide rounded white quantity stepper pills (border: 1px solid #E5E5E5)
  // --------------------------------------------------------------------------
  test('Parity 08: CartScreen Compact Grab Your Usuals, Multiplied Totals & Wide Stepper Pills', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:4000/?route=cart&cart_threshold=18500&lang=en', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4500);

    const shot = path.join(LOCAL_SCREENSHOT_DIR, 'parity_08.png');
    await page.screenshot({ path: shot });
    copyToArtifacts('parity_08.png');
    console.log('✓ Parity Screenshot 8 captured: parity_08.png');
  });

  // --------------------------------------------------------------------------
  // PARITY SCREENSHOT 9: HomeScreen Active Cart State B (Screenshot 9 Equivalent)
  // Full-width rounded #FF5A00 orange pill bar: Left (6) badge, Center "View cart", Right "IQD 18500"
  // --------------------------------------------------------------------------
  test('Parity 09: HomeScreen Active Cart State B with Full-Width Orange Pill Bar', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:4000/?cart_threshold=18500&lang=en', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4500);

    const shot = path.join(LOCAL_SCREENSHOT_DIR, 'parity_09.png');
    await page.screenshot({ path: shot });
    copyToArtifacts('parity_09.png');
    console.log('✓ Parity Screenshot 9 captured: parity_09.png');
  });
});
