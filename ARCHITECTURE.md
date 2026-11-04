# BazMart Technical Architecture & System Design Document

## 1. Executive Summary & Business Model

**BazMart** is a premier on-demand rapid grocery delivery platform purpose-built for the **Kurdistan Region and Iraq** market. Modeled after the best-in-class UX and operational speed of **Talabat Mart**, BazMart operates in close commercial partnership with a major hypermarket/supermarket partner in Kurdistan.

### Core Commercial & POS Partnership Model
1. **Partner Supermarket Warehouse & Zero Markup Rule:**
   - All inventory resides in the partner supermarket's warehouse/shelves.
   - All catalog data, barcodes, stock quantities, and prices originate from the **Partner Supermarket POS System**.
   - **Strict 100% Shelf-Price Parity:** In-app selling price is strictly identical to the supermarket's shelf/POS price (`0 IQD variance`).
2. **Fixed 3% Sales Commission Agreement (3% to BazMart / 97% to Partner Supermarket):**
   - BazMart earns a fixed 3.00% (0.03) commission on the gross shelf value (`subtotal_iqd`) of all products sold through the app.
   - Canonical benchmark: On a `100,000 IQD` shelf order, BazMart earns `3,000 IQD` (3%), and the Supermarket receives `97,000 IQD` (97%).
3. **COD Cash Settlement & Coupon Attribution:**
   - When BazMart riders collect Cash on Delivery (`COD`), 97% of the shelf subtotal belongs to the Partner Supermarket, and 3% belongs to BazMart.
   - BazMart promotional vouchers and coupon subsidies are deducted from BazMart's share (unless marked as partner-funded).
4. **Plug-and-Play POS Database Bridge:**
   - Modular interface `App\Contracts\PartnerPosConnectorInterface` ready for final pre-launch direct database connection (SQL Server, MySQL, PostgreSQL, Oracle, or REST Webhooks).

### Key Pillars
- **Hyper-Local Fulfillment:** Dark stores and partner supermarket pick-and-pack stations across Erbil, Sulaymaniyah, Duhok, and Baghdad for sub-20 minute order fulfillment.
- **Dedicated Fleet Dispatch:** Algorithmic routing and batching to internal couriers.
- **Dynamic Inventory & ERP/POS Sync:** Real-time synchronization with central partner supermarket POS databases.
- **Localized First-Class UX:** Trilingual support (Kurdish Sorani, Arabic, English) with full bidirectional LTR/RTL rendering and native Iraqi Dinar (`IQD`) integer currency formatting.

---

## 2. Market Localization & Currency Standards

### Currency
- **Code:** `IQD` (Iraqi Dinar).
- **Format Rule:** Integers with zero decimals, prefixed with `IQD ` (e.g., `IQD 2250`, `IQD 7000`, `IQD 18500`).
- **Rounding:** All discounts and subtotal calculations truncate or round to the nearest whole Dinar. No fractional denominations exist in daily commerce.

### Internationalization (i18n) & Directionality
| Language | Code | Direction | Typography / Script | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Kurdish Sorani** | `ckb` | RTL | Arabic/Kurdish (`Vazirmatn` / `Noto Sans Arabic`) | Primary regional vernacular |
| **Arabic** | `ar` | RTL | Modern Standard Arabic (`Noto Sans Arabic`) | National Iraqi reach |
| **English** | `en` | LTR | System Sans-Serif (`Inter` / Flutter default) | Baseline reference layout & expats |

Layouts mirror automatically on direction change:
- Horizontal product cards scroll right-to-left in RTL mode.
- Back chevron (`<`) flips to (`>`) in RTL mode.
- Category grids and search inputs align strictly to start/end boundaries.

---

## 3. Monorepo Structure

```
BazMart/
├── .antigravityrules           # Architectural constraints & dev rules
├── ARCHITECTURE.md             # Complete system architecture documentation
├── mobile-app/                 # Flutter mobile & web application
│   ├── android/
│   ├── ios/
│   ├── web/
│   └── lib/
│       ├── core/
│       │   ├── theme/          # Talabat Mart design tokens & painters
│       │   ├── localization/   # Trilingual dictionary & RTL/LTR provider
│       │   ├── models/         # ERP-ready data models
│       │   ├── data/           # Mock ERP repository & catalog
│       │   └── state/          # Reactive cart & threshold store
│       └── features/
│           ├── home/           # Sticky bar, promos, categories, carousels
│           ├── product_detail/ # PDP & frequently bought together
│           └── cart/           # Cart view, usuals upsell, COD checkout
├── backend-laravel/            # Enterprise Laravel 11/12 API Engine (Port 4001)
│   ├── app/Http/Controllers/   # Modular API V1 Controllers
│   ├── app/Services/           # Domain Services (Linguistic, Orders, Coupons, Fleet, ERP)
│   ├── app/Models/             # Eloquent Models extending BaseModel (automatic camelCase)
│   ├── database/migrations/    # 20 Enterprise relational database tables
│   └── database/seeders/       # Canonical seeders (400 SKUs, 20 categories, 15 brands)
├── backend/                    # Reference NestJS API & Prisma Schema
└── admin-web/                  # Next.js operations & catalog admin (Port 4002)
    └── README.md               # Operations console architecture
```

---

## 4. Mobile & Web Application Architecture (Flutter)

### Target Platforms
- **iOS & Android:** High-performance native compiled binaries via Flutter.
- **Flutter Web (Dev & Testing):** Enabled specifically for browser-based validation, UI inspection, and automated testing.
  - **Dev Port:** Must always serve on **`http://localhost:4000`** (or `4001` if busy).
  - **Port Safety:** Port `3000` is strictly reserved.
  - **Web Wrapper:** Uses a centered mobile viewport container (`maxWidth: 430px`) simulating a modern iOS/Android device frame with realistic drop shadows and phone aspect ratio.

### State Management & Data Flow
- **Cart & Store State:** Reactive state management (`ChangeNotifier` / `InheritedNotifier`) tracking:
  - Line items, quantities, and real-time total calculation.
  - Minimum order threshold checking (`IQD 7000`).
  - Active warehouse inventory limits per SKU.
  - Active locale and text direction (`TextDirection.ltr` / `TextDirection.rtl`).

---

## 5. UI Design System Tokens (Talabat Mart Visual Clone)

| Token Name | Hex / Value | Usage |
| :--- | :--- | :--- |
| **Scaffold Background** | `#FFFFFF` | Primary screen surface |
| **Primary Brand Orange** | `#FF5A00` | CTA buttons, active badges, `+` icons, promo waves |
| **Product Box Surface** | `#F5F6F8` | Image background (`borderRadius: 12px`) |
| **Promo Card Surface** | `#F6F1EB` | Cream promo cards with curved orange wave |
| **Discount Badge** | `#A4FF00` | Neon lime badge (`Save 15%`), bold black text |
| **Highlighter Marker** | `#FFF176` | Yellow marker strip behind sale price text |
| **Strikethrough Old Price** | `#8E8E93` | Prior price display |
| **Neutral Grey Border** | `#E5E7EB` | Dividers, search borders, button outlines |
| **Search Bar Fill** | `#F3F4F6` | Pill-shaped search bar background |

---

## 6. Catalog, ERP & Inventory Integration (Phase 2 Roadmap)

The catalog is designed to synchronize with enterprise ERP and POS systems:
- Central warehouse master catalog feeds SKUs, barcodes, brand relationships, category hierarchies, and nutritional metadata.
- Local dark store POS nodes push inventory increments, decrements, and stock reservation webhooks.
- In-app product models adhere to ERP fields:
  - `externalErpId`: External database primary key.
  - `sku`: Stock keeping unit.
  - `barcode`: EAN-13 / UPC barcode string.
  - `stockQuantity`: Live available quantity in active dark store.
  - `storageTemp`: Temperature classification (e.g., `Stored at 5°`).

---

## 7. Payments Architecture & Strategy Pattern

Payment processing is architected with the **Strategy Pattern**:
```dart
abstract class PaymentGatewayAdapter {
  String get id;
  String get name;
  bool get isEnabled;
  Future<PaymentResult> processPayment(PaymentContext context);
}
```

### Supported Gateways
1. **Cash on Delivery (COD) [Active Default]:**
   - Zero gateway dependency, verified on delivery confirmation.
2. **FastPay Adapter [Gateway Ready]:**
   - Mobile wallet direct push/QR for Kurdistan/Iraq.
3. **ZainCash Adapter [Gateway Ready]:**
   - Iraq-wide mobile payment gateway.
4. **First Iraqi Bank (FIB) [Gateway Ready]:**
   - Native instant bank transfer & QR payment.
5. **Credit / Debit Cards [Gateway Ready]:**
   - Visa / MasterCard via regional acquirer.

---

## 8. Step 17 Architecture: Bespoke 400-SKU Visuals, POS Scanner & Parity Verifier

### 1. 400-SKU Bespoke Packaging Artwork Engine (`mobile-app`)
- Implemented `ProductPackagingVisual` (`mobile-app/lib/core/widgets/product_packaging_visual.dart`):
  - Dedicated bespoke vector packaging illustrations for 20 top benchmark items:
    - `p-alrahma` (Al Rahma Fresh Milk 1L — carton with green cap & pure droplet)
    - `p-ramak` (Ramak Milk carton with red 3% FAT banner)
    - `p-eggs` (Farm Fresh 15 Eggs tray with yolk detailing)
    - `p-almarai` (Almarai Cream Cheese 500g glass jar)
    - `p-cucumber` (Crisp Kurdish cucumber with fresh drop & "LOCAL CRISP" tag)
    - `p-piano-pen` (Classic blue gel pen package)
    - `p-mountain-dew` (Mountain Dew can with green/red neon graphic)
    - `p-schauma` (Schauma shampoo bottle with 7-herbs badge)
    - `p-shallot` (Fresh Sulaymaniyah shallots / Kurdish garlic cluster)
    - `p-grapefruit` (Sun-ripened pink grapefruit cross-section)
    - `p-pepper-color` (Trio of sweet bell peppers: red, yellow, green)
    - `p-tabasco-chicken` & `p-tabasco-beef` (Tabasco ramen cup with flame accents)
    - `p-nescafe-iced-caramel` & `p-nescafe-iced-vanilla` (Frosted iced coffee cup with caramel drizzle)
    - `p-coconut-milk` (Coconut milk tin with coconut half)
    - `p-rabbit-lollipop` & `p-chewy-candy` (Candy wrappers with vivid gradients)
    - `p-kurdish-bread` (Traditional Kurdish stone-baked flatbread)
    - `p-kurdistan-chicken` (Fresh premium Kurdish poultry packaging)
  - Deterministic category visual engine for the remaining 380 SKUs across all 20 grocery categories with pastel gradients, category emblems, and dynamic color accents.

### 2. Supermarket Shelf Barcode Scanner & Price-Parity Verifier Modal
- In the Customer App (`sticky_top_bar.dart` and `search_screen.dart`), customers can tap the `[POS]` barcode icon to launch the `BarcodeScannerParityModal`:
  - Laser viewfinder with real-time glowing beam animation.
  - Instant quick chips for benchmark barcodes (`6291100010014`, `6291100010052`, `6291100010120`).
  - Live validation against the backend API `GET /api/v1/catalog/barcode/:barcode`.
  - Official **100% Shelf-Price Parity Certificate** badge displaying shelf price, in-app price, and 0 IQD variance (Zero Markup).

### 3. Live POS Cashier Simulator on `/erp-sync` (`admin-web`)
- **Tool A (Live Shelf Price Update Form):** Simulates a partner supermarket cashier updating shelf prices; dispatches `POST /api/v1/erp/webhook/stock-update` and verifies instant parity sync.
- **Tool B (Fixed 3% Commission Calculator):** Calculates $100\% = 3\% + 97\%$ commercial split on any basket amount (e.g., 100,000 IQD -> 3,000 IQD BazMart / 97,000 IQD partner) and generates official printable `#POS-SET-XXXXXX` settlement vouchers.

### 4. Sulaymaniyah Flagship Launch Hub Hardening
- Default facility in Admin Portal set to `suly-main-darkstore` (Sulaymaniyah Partner Hypermarket).
- Default benchmark voucher `#POS-SET-10001` assigned to `suly-main-darkstore` (100,000 IQD gross -> 3,000 IQD BazMart / 97,000 IQD partner).
- Restored full 14-customer database with Ako Muhamad (`+9647701234567`) in Sulaymaniyah as the primary VIP testing account.
