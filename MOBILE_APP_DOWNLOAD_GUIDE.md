# BazMart Mobile App — Download & Installation Guide (Android & iOS)

This guide explains how to generate, download, and install the **BazMart Customer Mobile App** on Android smartphones and Apple iPhones.

---

## ⚡ 1-Click Cloud Compilation with GitHub Actions

The automated workflow file is located at [`.github/workflows/build-mobile-apps.yml`](file:///.github/workflows/build-mobile-apps.yml).

### How to trigger a build:
1. Push your repository to **GitHub** (e.g. `https://github.com/your-username/bazmart`).
2. In your GitHub repository page, navigate to the **Actions** tab at the top.
3. In the left sidebar, click **"BazMart Mobile — Android & iOS Cloud Build"**.
4. Click the **"Run workflow"** button on the right:
   - **Build Type**: `release` (default)
   - **Also generate Google Play App Bundle (AAB)?**: Checked `true`
5. Click **"Run workflow"** (Green button).
6. The cloud runners will execute:
   - 🤖 **Ubuntu Linux Runner**: Compiles `BazMart-Release.apk` and `BazMart-Release.aab`.
   - 🍎 **macOS Runner (Apple Xcode)**: Compiles and packages `BazMart-Customer-iOS.ipa`.
7. Once finished (~3-5 minutes), scroll to the **Artifacts** section at the bottom of the run page to download:
   - 📦 `BazMart-Android-APK` (Directly installable on any Android phone)
   - 📦 `BazMart-Android-Bundle-AAB` (Ready to upload to Google Play Developer Console)
   - 📦 `BazMart-iOS-IPA` (Installable iOS application package)

---

## 📱 How to Install on Android Phones

1. Download **`BazMart-Release.apk`** to your phone (via browser, WhatsApp, Telegram, Google Drive, or USB cable).
2. Tap the downloaded `.apk` file.
3. If prompted:
   - Tap **Settings** ➔ Toggle on **"Allow from this source"** (Unknown sources).
4. Tap **Install**.
5. BazMart will appear on your home screen with the official orange icon and Kurdish Sorani RTL / Arabic / English support.

---

## 🍎 How to Install on iPhones (iOS)

Apple protects iOS devices by requiring apps to be installed through signed certificates or sideloading tools. You have three flexible options:

### Method 1: Sideload via Sideloadly or AltStore (Free & Instant — No Developer Account Required)
1. Download **`BazMart-Customer-iOS.ipa`** from your GitHub Actions artifacts.
2. Install **[Sideloadly](https://sideloadly.io)** (Windows & Mac) or **[AltStore](https://altstore.io)**.
3. Connect your iPhone to your PC via USB cable.
4. Drag and drop `BazMart-Customer-iOS.ipa` into Sideloadly.
5. Enter your regular Apple ID and click **Start**.
6. On your iPhone: Go to **Settings ➔ General ➔ VPN & Device Management** ➔ Tap your Apple ID ➔ Tap **Trust**.
7. The app is now installed and fully functional on your iPhone!

### Method 2: TestFlight / Apple Developer Program (Official Distribution)
1. If you have an Apple Developer account ($99/year), sign in to [App Store Connect](https://appstoreconnect.apple.com).
2. Upload the built `.ipa` via Transporter or Xcode.
3. Add internal/external testers via email for 1-tap installation via the official **TestFlight** app.

### Method 3: Progressive Web App (PWA) — Instant 5-Second Install (No Files Needed)
1. Open Safari on your iPhone.
2. Navigate to your BazMart Customer URL (e.g. `http://<your-server-or-ip>:4000/?lang=ckb`).
3. Tap the **Share** button (the square with an upward arrow at the bottom of Safari).
4. Scroll down and tap **"Add to Home Screen"** (`+`).
5. Tap **Add**.
6. BazMart will immediately appear on your iPhone home screen as an app icon with full-screen standalone mode.

---

<div dir="rtl">

## ڕێبەری دابەزاندن و دامەزراندن لەسەر مۆبایل (بە کوردیی سۆرانی)

### ١. دروستکردنی فایلی ئەپڵیکەیشن بە یەک کلیک لە (GitHub Actions):
- بڕۆ بۆ بەشی **Actions** لە گیت‌هەب.  
- کلیک لەسەر پرۆسەی **«BazMart Mobile — Android & iOS Cloud Build»** بکە.  
- دوگمەی **«Run workflow»** دابگرە.  
- دوای ٣ بۆ ٥ خولەک، هەردوو فایلی ئامادەکراو بۆ دابەزاندن لە خوارەوە دەردەکەون:  
  - فایلی **`BazMart-Release.apk`** بۆ ئەندرۆید.  
  - فایلی **`BazMart-Customer-iOS.ipa`** بۆ ئایفۆن.  

### ٢. دامەزراندن لەسەر ئەندرۆید:
- تەنها فایلی `BazMart-Release.apk` بنێرە بۆ مۆبایلەکەت (لە ڕێگەی واتسئاپ، تێلیگرام، یان کێبڵ).  
- کلیکی لەسەر بکە و دوگمەی **Install** دابگرە؛ دەستبەجێ لەسەر شاشەی مۆبایلەکەت دادەمەزرێت.  

### ٣. دامەزراندن لەسەر ئایفۆن:
- دەتوانیت فایلی `BazMart-Customer-iOS.ipa` بە بەکارهێنانی بەرنامەی بێبەرامبەری **Sideloadly** لە ڕێگەی کۆمپیوتەرەوە بخەیتە سەر ئایفۆنەکەت.  
- یان بەبێ هیچ فایلێک لە وێبگەڕی Safari بڕۆیە سەر بەستەری ئەپەکە و دوگمەی **«Add to Home Screen»** دابگرە بۆ ئەوەی وەک ئەپێکی ڕاستەقینە کار بکات.  

</div>

