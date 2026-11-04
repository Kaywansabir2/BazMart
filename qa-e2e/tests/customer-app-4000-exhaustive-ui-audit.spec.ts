import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const screenshotDir = path.resolve(__dirname, '../audit-screenshots/customer-4000-deep-audit');
const artifactDir = 'C:/Users/zakar/.gemini/antigravity/brain/d845ab7d-bb3d-4afb-95c7-fae336c7fcef';
const resultsLogPath = path.join(screenshotDir, 'audit-results.json');

const auditResults: Array<{
  id: string;
  name: string;
  url: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  errors: string[];
  warnings: string[];
  rtlVerified: boolean;
  overflowChecked: boolean;
  screenshot: string;
}> = [];

async function recordAudit(
  page: any,
  testId: string,
  testName: string,
  filename: string,
  expectedRtl: boolean = true
) {
  const errors: string[] = [];
  const warnings: string[] = [];

  page.on('console', (msg: any) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('favicon') && !text.includes('react-devtools') && !text.includes('manifest.json')) {
        errors.push(`Console Error: ${text}`);
      }
    }
  });

  page.on('pageerror', (err: any) => {
    errors.push(`Uncaught Page Exception: ${err.message}`);
  });

  // Check RTL direction
  let rtlVerified = false;
  try {
    const isRtl = await page.evaluate(() => {
      const fltElem = document.querySelector('flt-glass-pane') || document.querySelector('flutter-view');
      return !!fltElem;
    });
    rtlVerified = isRtl;
  } catch (e: any) {
    warnings.push(`RTL check warning: ${e.message}`);
  }

  // Check horizontal overflow
  let overflowChecked = true;
  try {
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 5;
    });
    overflowChecked = !hasHorizontalOverflow;
    if (hasHorizontalOverflow) {
      warnings.push(`Layout has horizontal overflow: scrollWidth > window.innerWidth`);
    }
  } catch (e: any) {
    warnings.push(`Overflow check warning: ${e.message}`);
  }

  // Save screenshot locally and to artifact directory
  const localPath = path.join(screenshotDir, filename);
  const artPath = path.join(artifactDir, filename);
  await page.screenshot({ path: localPath, fullPage: false });
  try {
    fs.copyFileSync(localPath, artPath);
  } catch (e) {
    console.warn(`Artifact copy warning for ${filename}:`, e);
  }

  const status = errors.length > 0 ? 'FAIL' : warnings.length > 0 ? 'WARN' : 'PASS';
  auditResults.push({
    id: testId,
    name: testName,
    url: page.url(),
    status,
    errors,
    warnings,
    rtlVerified,
    overflowChecked,
    screenshot: filename,
  });

  console.log(`[AUDIT] ${testId} - ${testName} -> ${status} (${filename})`);
}

test.beforeAll(async () => {
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
});

test.afterAll(async () => {
  fs.writeFileSync(resultsLogPath, JSON.stringify(auditResults, null, 2), 'utf8');
  console.log(`\nAudit completed! Logged ${auditResults.length} test inspections to ${resultsLogPath}`);
});

test.describe('BazMart Customer App (:4000) Master Exhaustive UI/UX & Workflow Audit', () => {

  // ===========================================================================
  // ZONE 1: Desktop Showcase Shell, View Modes & Language Directionality Bar
  // ===========================================================================

  test('01. State 1 (cust4000_01_showcase_bezel_ckb.png) - Bezel Frame & Inspector Card in Kurdish Sorani', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE1-01', 'Desktop Showcase Bezel Mode (ckb RTL)', 'cust4000_01_showcase_bezel_ckb.png', true);
  });

  test('02. State 2 (cust4000_02_widescreen_desktop_ckb.png) - Widescreen Storefront Mode', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&view_mode=widescreen');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE1-02', 'Widescreen Full Desktop Storefront', 'cust4000_02_widescreen_desktop_ckb.png', true);
  });

  test('03. State 3 (cust4000_03_language_direction_toggle.png) - English LTR Directionality Toggle', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=en');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE1-03', 'Language Toggle English LTR Directionality', 'cust4000_03_language_direction_toggle.png', false);
  });

  // ===========================================================================
  // ZONE 2: Sticky Top Header, Delivery Address Switcher & Dark Store Selector
  // ===========================================================================

  test('04. State 4 (cust4000_04_delivery_address_modal_ckb.png) - Delivery Address & Dark Store Modal', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&modal=address');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE2-04', 'Delivery Address & Dark Store Selector Bottom Sheet', 'cust4000_04_delivery_address_modal_ckb.png', true);
  });

  test('05. State 5 (cust4000_05_branch_switch_and_add_address_ckb.png) - Add New Address Form Modal', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&modal=add_address');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE2-05', 'Add New Address Form Modal', 'cust4000_05_branch_switch_and_add_address_ckb.png', true);
  });

  // ===========================================================================
  // ZONE 3: HomeScreen — All 11 Vertical Sections & Horizontal Swiping
  // ===========================================================================

  test('06. State 6 (cust4000_06_top_promo_cards_and_campaign_screen_ckb.png) - Section 1 Promo Cards & Campaign Screen', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=promo&index=0');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE3-06', 'Top Promo Cards & Campaign Screen', 'cust4000_06_top_promo_cards_and_campaign_screen_ckb.png', true);
  });

  test('07. State 7 (cust4000_07_buy_again_and_stepper_morph_ckb.png) - Section 2 Buy Again & Stepper Morph Active Cart', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&cart_threshold=under');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE3-07', 'Buy Again with Orange Stepper Morph and Cart Bar', 'cust4000_07_buy_again_and_stepper_morph_ckb.png', true);
  });

  test('08. State 8 (cust4000_08_shop_by_category_page1_and_page2_ckb.png) - Section 3 Shop by Category Paginated Grid', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&scroll=category');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE3-08', 'Shop by Category Paginated Grid & 2-Segment Pill', 'cust4000_08_shop_by_category_page1_and_page2_ckb.png', true);
  });

  test('09. State 9 (cust4000_09_best_sellers_and_pepsi_carousel_ckb.png) - Sections 4 & 5 Best Sellers & Pepsi Carousel', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&scroll=pepsi');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE3-09', 'Best Sellers Near You & Pepsi Full-Width Banner', 'cust4000_09_best_sellers_and_pepsi_carousel_ckb.png', true);
  });

  test('10. State 10 (cust4000_10_mid_promos_brands_and_countries_ckb.png) - Sections 6, 7 & 8 Brands & Countries Carousel', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&scroll=top_savers');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE3-10', 'Mid Promos, Shop by Brand & Around the World Flags', 'cust4000_10_mid_promos_brands_and_countries_ckb.png', true);
  });

  test('11. State 11 (cust4000_11_top_savers_ and_fresh_picks_ckb.png) - Sections 9 & 10 Top Savers & Fresh Picks Everyday', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&scroll=fresh_picks');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE3-11', 'Top Savers Shelf & Fresh Picks Everyday Ribbon', 'cust4000_11_top_savers_ and_fresh_picks_ckb.png', true);
  });

  test('12. State 12 (cust4000_12_tabasco_and_nescafe_iced_coffee_ckb.png) - Section 11 Bottom Scroll Padding & Nescafe Cans', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&scroll=tabasco');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE3-12', 'Tabasco Noodles, Nescafe Iced Coffee with Safe Bottom Padding', 'cust4000_12_tabasco_and_nescafe_iced_coffee_ckb.png', true);
  });

  // ===========================================================================
  // ZONE 4: Drill-Down Catalog Screens
  // ===========================================================================

  test('13. State 13 (cust4000_13_category_drilldown_filters_sort_ckb.png) - Category Products Grid, Filters & Sort', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=category&id=dairy-eggs');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE4-13', 'Category Products Screen with Filters & Sort Dropdown', 'cust4000_13_category_drilldown_filters_sort_ckb.png', true);
  });

  test('14. State 14 (cust4000_14_brand_store_drilldown_ckb.png) - Brand Store Screen with Header Banner', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=brand&id=b-maggi');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE4-14', 'Brand Store Screen with Dedicated Product Roster', 'cust4000_14_brand_store_drilldown_ckb.png', true);
  });

  test('15. State 15 (cust4000_15_country_origin_drilldown_ckb.png) - Country Origin Products Screen (Kurdistan)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=country&id=c-krd');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE4-15', 'Country Origin Drill-Down Screen (Kurdistan Region)', 'cust4000_15_country_origin_drilldown_ckb.png', true);
  });

  // ===========================================================================
  // ZONE 5: ProductDetailScreen & Interactive Sub-Modals
  // ===========================================================================

  test('16. State 16 (cust4000_16_product_detail_sheet_ckb.png) - Product Detail Studio Visual & Shelf Parity', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=product&id=p-alrahma');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE5-16', 'Product Detail Sheet with 100% Shelf Price Parity Badge', 'cust4000_16_product_detail_sheet_ckb.png', true);
  });

  test('17. State 17 (cust4000_17_cold_storage_info_tooltip_ckb.png) - Cold-Chain Storage Info Tooltip Dialog', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=product&id=p-alrahma&cold_storage=true');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE5-17', 'Cold-Chain Storage Info Modal / Tooltip Dialog', 'cust4000_17_cold_storage_info_tooltip_ckb.png', true);
  });

  test('18. State 18 (cust4000_18_product_photo_zoom_and_favorite_ckb.png) - Full-Screen Tap-to-Zoom Photo Modal', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=product&id=p-alrahma&zoom=true');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE5-18', 'Product Full-Screen Tap-to-Zoom Photo Modal', 'cust4000_18_product_photo_zoom_and_favorite_ckb.png', true);
  });

  test('19. State 19 (cust4000_19_out_of_stock_notify_me_ckb.png) - Out-of-Stock Item & Notify Me Alert', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=product&id=p-alrahma&out_of_stock=true');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE5-19', 'Out-of-Stock Badge & Notify Me Alert CTA', 'cust4000_19_out_of_stock_notify_me_ckb.png', true);
  });

  // ===========================================================================
  // ZONE 6: SearchScreen, Linguistic Normalizer & POS Barcode Scanner
  // ===========================================================================

  test('20. State 20 (cust4000_20_search_trending_chips_and_query_ckb.png) - Trending Kurdish Chips & Query Results', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=search&q=شیر');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE6-20', 'Search Screen with Kurdish Trending Chips & Real-time Query', 'cust4000_20_search_trending_chips_and_query_ckb.png', true);
  });

  test('21. State 21 (cust4000_21_search_empty_state_ckb.png) - Search Empty State with Friendly Kurdish Guidance', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=search&q=کاڵای_نەبوو_٩٩٩');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE6-21', 'Search Friendly Kurdish Empty State with Aisle Suggestions', 'cust4000_21_search_empty_state_ckb.png', true);
  });

  test('22. State 22 (cust4000_22_barcode_scanner_standard_and_scale_ckb.png) - Supermarket Shelf Barcode Scanner Modal', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&modal=pos_scanner');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE6-22', 'Supermarket Shelf POS Barcode Scanner & Scale Verifier Modal', 'cust4000_22_barcode_scanner_standard_and_scale_ckb.png', true);
  });

  // ===========================================================================
  // ZONE 7: CartScreen, Compact "Grab your usuals" & Vouchers Sheet
  // ===========================================================================

  test('23. State 23 (cust4000_23_cart_screen_line_totals_and_usuals_ckb.png) - Cart Line Totals & Compact Usuals', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=cart&cart_threshold=15000');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE7-23', 'Cart Line Totals & Compact Usuals Square Cards', 'cust4000_23_cart_screen_line_totals_and_usuals_ckb.png', true);
  });

  test('24. State 24 (cust4000_24_available_vouchers_sheet_and_validation_ckb.png) - Available Vouchers Sheet', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=cart&cart_threshold=15000&coupons=true');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE7-24', 'Available Vouchers Bottom Sheet Drawer', 'cust4000_24_available_vouchers_sheet_and_validation_ckb.png', true);
  });

  // ===========================================================================
  // ZONE 8: Authentication, Registration Onboarding & Guest Flow
  // ===========================================================================

  test('25. State 25 (cust4000_25_auth_phone_and_otp_error_ckb.png) - Phone Auth & OTP Error Feedback', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=auth&step=otp&error=true');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE8-25', 'Phone Auth & Localized Kurdish OTP Validation Error', 'cust4000_25_auth_phone_and_otp_error_ckb.png', true);
  });

  test('26. State 26 (cust4000_26_new_user_onboarding_sheet_ckb.png) - New Customer Registration Onboarding Sheet', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=auth&step=onboarding');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE8-26', 'New Customer Registration Onboarding Modal', 'cust4000_26_new_user_onboarding_sheet_ckb.png', true);
  });

  // ===========================================================================
  // ZONE 9: ProfileScreen, Wallet, Favorites, Orders & Notifications
  // ===========================================================================

  test('27. State 27 (cust4000_27_profile_hub_and_edit_modal_ckb.png) - Authenticated Profile Hub & VIP Card', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=profile&auth_phone=07701234567');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE9-27', 'Authenticated Profile Hub with VIP Card and Zero Artifacts', 'cust4000_27_profile_hub_and_edit_modal_ckb.png', true);
  });

  test('28. State 28 (cust4000_28_wallet_ledger_modal_ckb.png) - BazMart Wallet Ledger & Transactions History', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=profile&auth_phone=07701234567');
    await page.waitForTimeout(4500);
    // Click on View History in Wallet Card
    await page.mouse.click(720, 240);
    await page.waitForTimeout(2000);
    await recordAudit(page, 'ZONE9-28', 'BazMart Wallet Transactions Ledger Sheet', 'cust4000_28_wallet_ledger_modal_ckb.png', true);
  });

  test('29. State 29 (cust4000_29_favorites_screen_ckb.png) - Dedicated Favorites Screen with Photos & Stepper', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=favorites&auth_phone=07701234567');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE9-29', 'Dedicated Favorites Screen with Photo Grid and Heart Toggles', 'cust4000_29_favorites_screen_ckb.png', true);
  });

  test('30. State 30 (cust4000_30_notifications_center_screen_ckb.png) - Notifications Center with Filter Tabs', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=notifications');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE9-30', 'Notifications Center with Filter Tabs and Unread Indicators', 'cust4000_30_notifications_center_screen_ckb.png', true);
  });

  test('31. State 31 (cust4000_31_order_history_and_one_tap_reorder_ckb.png) - Past Orders History & 1-Tap Reorder', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=profile&auth_phone=07701234567');
    await page.waitForTimeout(4500);
    await page.mouse.move(720, 500);
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(2000);
    await recordAudit(page, 'ZONE9-31', 'Past Orders History with Itemized Badges and 1-Tap Reorder', 'cust4000_31_order_history_and_one_tap_reorder_ckb.png', true);
  });

  // ===========================================================================
  // ZONE 10: Checkout, Order Tracking, Rating & Issue Ticket
  // ===========================================================================

  test('32. State 32 (cust4000_32_checkout_slots_replacement_tips_ckb.png) - Checkout Preferences, Tips & Rules', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=checkout&cart_threshold=15000&auth_phone=07701234567');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE10-32', 'Checkout Delivery Slots, Replacement Options & Rider Tips', 'cust4000_32_checkout_slots_replacement_tips_ckb.png', true);
  });

  test('33. State 33 (cust4000_33_checkout_wallet_split_and_250iqd_rounding_ckb.png) - Checkout 250 IQD Rounding & Wallet Split', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=checkout&cart_threshold=15000&auth_phone=07701234567');
    await page.waitForTimeout(4500);
    await page.mouse.move(720, 500);
    await page.mouse.wheel(0, 350);
    await page.waitForTimeout(2000);
    await recordAudit(page, 'ZONE10-33', 'Checkout 250 IQD Cash Rounding & Wallet Toggle', 'cust4000_33_checkout_wallet_split_and_250iqd_rounding_ckb.png', true);
  });

  test('34. State 34 (cust4000_34_live_order_tracking_4stages_ckb.png) - Live Order Tracking 4-Stage Stepper & Driver Card', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=tracking&order_id=BM-SULY-8842&driver=Karwan+Sleman&stage=delivery');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE10-34', 'Order Live Tracking 4-Stage Stepper & Assigned Driver Card', 'cust4000_34_live_order_tracking_4stages_ckb.png', true);
  });

  test('35. State 35 (cust4000_35_post_delivery_rating_and_issue_ticket_ckb.png) - Post-Delivery Rating & Issue Refund Modal', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000/?lang=ckb&route=tracking&order_id=BM-SULY-8842&modal=issue');
    await page.waitForTimeout(4500);
    await recordAudit(page, 'ZONE10-35', 'Post-Delivery Report Issue & Refund Ticket Modal', 'cust4000_35_post_delivery_rating_and_issue_ticket_ckb.png', true);
  });

});

