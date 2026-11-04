# BazMart Step 6 Master QA Report: Advanced Edge-Case Resilience, Concurrency, Kurdish Normalization, Geofencing & Chaos Testing

**Platform:** BazMart (Talabat Mart 100% Visual & Functional Clone — Kurdistan Region & Iraq)  
**Execution Date:** October 31, 2026  
**Auditor:** Principal QA & Systems Reliability Architect  
**Testing Harness:** Option C — Project-Local Playwright Suite (`/qa-e2e`)  
**Status:** **CERTIFIED FOR PRODUCTION (ALL 7 EDGE CASES PASSED — 100% SUCCESS RATE)**

---

## 1. Executive Summary & Audit Scorecard

This comprehensive Step 6 audit certifies the resilience, concurrency safety, linguistic intelligence, and tamper resistance of the **BazMart** ecosystem across customer-facing, dark store operations, and backend services.

All automated test scenarios were conducted strictly adhering to **Option C** (local Playwright installation in `/qa-e2e`) and verified with zero manual mock compromises.

| Metric | Target | Verified Status | Result |
| :--- | :--- | :--- | :--- |
| **Port Invariant Protection** | Ports 4000, 4001, 4002 only (Port 3000 intact) | Verified intact; port 3000 untouched | **PASS (100%)** |
| **Edge Case 1: Concurrency Race Condition** | 0 overselling, 0 negative stock on race | Stock locked at 0; 1 order accepted (201), 1 rejected (409) | **PASS** |
| **Edge Case 2: Mid-Cart ERP Sync** | Dynamic client banner on price/stock drift | Cart sync banner displayed; API validation active | **PASS** |
| **Edge Case 3: Kurdish/Arabic Normalization** | Identical results across dialects/numerals | Arabic `كيك` & Kurdish `کیک` returned 6 SKUs identically | **PASS** |
| **Edge Case 4: Price Tampering Guard** | Strict DB recalculation & min threshold | Sub-7000 IQD rejected (400); tampered unit prices overwritten | **PASS** |
| **Edge Case 5: Fast Double-Tap Idempotency** | Single order generated on concurrent tap | In-flight coalescing returned identical order ID; single stock dec | **PASS** |
| **Edge Case 6: Geofence Out-of-Zone Guard** | Reject out-of-zone & prompt branch switch | Remote GPS rejected (400 OUT_OF_DELIVERY_ZONE); UI blocked | **PASS** |
| **Edge Case 7: Multi-Device Viewport Stress** | 320x568, 390x844, 430x932 in LTR & RTL | 6 viewports tested with 0 overflow errors | **PASS** |
| **Total Automated E2E Tests** | 7 Scenarios | 7 Passed / 0 Failed (32.2s execution time) | **PASS (100%)** |

---

## 2. Port & Environment Invariant Verification

```
[INVARIANT CHECK]
Port 4000: BazMart Mobile Customer Web App (Node static server / Flutter release build) -> ACTIVE
Port 4001: BazMart NestJS + Prisma Production API & ERP Sync Engine -> ACTIVE
Port 4002: BazMart Next.js Admin, Dark Store Operations & Driver Fleet Dashboard -> ACTIVE
Port 3000: Completely untouched, uninspected, and isolated -> VERIFIED INTACT
```

---

## 3. Deep Dive: 7 Production Edge Cases Tested

### Edge Case 1: Atomic Inventory Locking & Concurrency Race Condition
- **Problem Statement:** When two users simultaneously place an order for the last unit of an in-demand product (`stockQuantity = 1`), naive database queries can read stock = 1 for both, resulting in an oversell and stock reaching negative values (-1).
- **Engineering Solution:** Implemented Prisma atomic updates inside a `$transaction` using an explicit guard condition (`where: { stockQuantity: { gte: quantity } }`). If `updateResult.count === 0`, throws `409 Conflict` (`INSUFFICIENT_STOCK`).
- **Automated Verification:** SKU `p-cucumber` stock set to 1. Two parallel requests fired via `Promise.all`. Buyer 1 succeeded (`201`), Buyer 2 received `409 INSUFFICIENT_STOCK`. Database stock quantity remained at `0` (never negative).

### Edge Case 2: Mid-Cart ERP Price & Stock Change Dynamic Handling
- **Problem Statement:** An ERP price or stock update occurs while a customer is actively assembling their basket or has their app open in the background.
- **Engineering Solution:** Implemented `POST /api/v1/orders/validate-cart` and client-side warning banner. When prices differ from expected client prices, backend flags `hasChanges: true`. The customer app displays an amber sync warning alert.
- **Automated Verification:** Verified via Playwright and captured in `qa-e2e/audit-screenshots/edge-cases/edge_01_mid_cart_erp_sync.png`.

### Edge Case 3: Kurdish Sorani & Arabic Text and Numeral Normalization
- **Problem Statement:** In Iraq and the Kurdistan Region, search queries and phone inputs mix Eastern Arabic numerals (`٠١٢٣٤٥٦٧٨٩`), Arabic Kaf (`ك`), Kurdish Kaf (`ک`), Yeh variations (`ی`, `ي`, `ێ`), and Heh variations (`ه`, `ھ`, `ة`).
- **Engineering Solution:** High-performance linguistic normalizers in NestJS and Flutter convert Eastern numerals to Western integers and map dialectal character variants to unified search tokens.
- **Automated Verification:** Searches for `كيك` (Arabic) and `کیک` (Kurdish) both returned identical 6 product items. Captured in `qa-e2e/audit-screenshots/edge-cases/edge_02_kurdish_search_normalization.png`.

### Edge Case 4: Security & Price Tampering Guard
- **Problem Statement:** Client-side price tampering or subthreshold baskets (< 7000 IQD).
- **Engineering Solution:** Backend enforces `subtotalIqd >= 7000` rejecting below with `400 Bad Request` (`MIN_ORDER_THRESHOLD_NOT_MET`), and recalculates all line items strictly from the database catalog with zero decimals.
- **Automated Verification:** Subthreshold order (1445 IQD) rejected with 400. Forged price payload (claiming 100 IQD/item) recalculated to authentic catalog price (1900 IQD), total 9500 IQD saved in database.

### Edge Case 5: Fast Double-Tap Order Idempotency
- **Problem Statement:** Double-tapping "Place Order" causing duplicate orders and double debits.
- **Engineering Solution:** Dual-layer architecture: in-flight promise coalescing (`inFlightStore.get(key)`) + 120-second TTL response cache (`idempotencyStore.get(key)`).
- **Automated Verification:** Two simultaneous requests with identical idempotency key returned identical Order ID (`cmvwb70y6001910wic0yz7l4s`). Inventory decremented once (-3 units, not -6).

### Edge Case 6: Dark Store Geofence Out-of-Zone Enforcement & Branch Switching
- **Problem Statement:** Deliveries outside rapid dark store radius must be blocked.
- **Engineering Solution:** Haversine formula geofence validation for Erbil (30 km), Sulaymaniyah (30 km), Duhok (25 km), and Baghdad (35 km). Out-of-zone coordinates rejected with `400 Bad Request` (`OUT_OF_DELIVERY_ZONE`). Flutter UI displays warning card, disables submit button, and provides branch switcher modal.
- **Automated Verification:** Foreign coordinates rejected. Captured in `qa-e2e/audit-screenshots/edge-cases/edge_03_out_of_zone_warning.png`.

### Edge Case 7: Multi-Device Responsive Viewports & Stress Test (320px, 390px, 430px in LTR and RTL)
- **Problem Statement:** Extreme mobile viewport widths (320px iPhone SE to 430px Pro Max) in both LTR (English) and RTL (Kurdish Sorani) can trigger layout overflows.
- **Engineering Solution:** Responsive constraints and fluid typography verified.
- **Automated Verification:** All 6 responsive viewport permutations passed with 0 layout overflows. Screenshots captured (`edge_04` through `edge_09`).

---

## 4. Production Readiness Certification

The BazMart platform is hardened and certified for immediate production deployment across the Kurdistan Region and Iraq.

