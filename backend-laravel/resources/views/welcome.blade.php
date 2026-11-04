<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>BazMart — Enterprise Quick-Commerce & Dark Store Ecosystem</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #020617;
            color: #f8fafc;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            line-height: 1.5;
        }
        a { color: inherit; text-decoration: none; }
        .top-bar {
            background: linear-gradient(90deg, #ea580c, #ff5a00, #d97706);
            color: #ffffff;
            font-size: 12px;
            font-weight: 700;
            padding: 8px 16px;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        .header {
            border-bottom: 1px solid #1e293b;
            background: rgba(15, 23, 42, 0.9);
            padding: 14px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .brand {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .logo-box {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: linear-gradient(135deg, #ff5a00, #fb923c);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 20px;
            color: #fff;
            box-shadow: 0 4px 12px rgba(255, 90, 0, 0.3);
        }
        .brand-title {
            font-size: 20px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.5px;
        }
        .badge-core {
            font-size: 10px;
            font-weight: 800;
            background: #ff5a00;
            color: #fff;
            padding: 2px 6px;
            border-radius: 4px;
            text-transform: uppercase;
            margin-left: 6px;
        }
        .sub-kurdish {
            font-size: 12px;
            color: #94a3b8;
        }
        .status-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.2);
            color: #34d399;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 700;
        }
        .dot-green {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #34d399;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 36px 20px;
            flex: 1;
            width: 100%;
        }
        .hero {
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #431407 100%);
            border: 1px solid #334155;
            border-radius: 16px;
            padding: 36px;
            margin-bottom: 36px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }
        .hero-tag {
            display: inline-block;
            padding: 4px 12px;
            background: rgba(255, 90, 0, 0.15);
            border: 1px solid rgba(255, 90, 0, 0.3);
            color: #ff5a00;
            font-size: 12px;
            font-weight: 700;
            border-radius: 999px;
            margin-bottom: 14px;
        }
        .hero-title {
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 12px;
            color: #ffffff;
            letter-spacing: -0.5px;
        }
        .hero-desc {
            font-size: 15px;
            color: #cbd5e1;
            margin-bottom: 24px;
            max-width: 800px;
        }
        .btn-group {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
        }
        .btn-primary {
            background: #ff5a00;
            color: #ffffff;
            padding: 12px 24px;
            border-radius: 10px;
            font-weight: 700;
            font-size: 14px;
            transition: all 0.2s;
            box-shadow: 0 4px 14px rgba(255, 90, 0, 0.3);
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        .btn-primary:hover {
            background: #e04f00;
            transform: translateY(-1px);
        }
        .btn-secondary {
            background: #1e293b;
            color: #ffffff;
            padding: 12px 24px;
            border-radius: 10px;
            font-weight: 700;
            font-size: 14px;
            border: 1px solid #334155;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        .btn-secondary:hover {
            background: #334155;
        }
        .section-label {
            font-size: 12px;
            font-weight: 800;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 16px;
        }
        .grid-3 {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 20px;
            margin-bottom: 36px;
        }
        .card {
            background: #0f172a;
            border: 1px solid #1e293b;
            border-radius: 14px;
            padding: 24px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            transition: border-color 0.2s;
        }
        .card:hover {
            border-color: #ff5a00;
        }
        .card-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
        }
        .card-icon {
            font-size: 28px;
        }
        .port-pill {
            font-family: monospace;
            font-size: 12px;
            font-weight: 700;
            padding: 4px 8px;
            border-radius: 6px;
        }
        .port-orange { background: rgba(255, 90, 0, 0.15); color: #ff5a00; border: 1px solid rgba(255, 90, 0, 0.3); }
        .port-purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }
        .port-green  { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
        .card-title {
            font-size: 18px;
            font-weight: 800;
            margin-bottom: 8px;
            color: #ffffff;
        }
        .card-desc {
            font-size: 13px;
            color: #94a3b8;
            margin-bottom: 16px;
            line-height: 1.5;
        }
        .card-checklist {
            list-style: none;
            font-size: 12px;
            color: #cbd5e1;
            margin-bottom: 20px;
        }
        .card-checklist li {
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .check-green { color: #34d399; font-weight: 800; }
        .card-btn {
            background: #1e293b;
            color: #ffffff;
            font-size: 13px;
            font-weight: 700;
            padding: 10px 16px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #334155;
            transition: all 0.2s;
            display: block;
        }
        .card:hover .card-btn {
            background: #ff5a00;
            border-color: #ff5a00;
        }
        .grid-submodules {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 12px;
        }
        .sub-link {
            background: #0f172a;
            border: 1px solid #1e293b;
            padding: 14px;
            border-radius: 12px;
            text-align: center;
            transition: all 0.2s;
        }
        .sub-link:hover {
            border-color: #ff5a00;
            transform: translateY(-2px);
        }
        .sub-icon { font-size: 22px; margin-bottom: 6px; }
        .sub-name { font-size: 13px; font-weight: 700; color: #ffffff; }
        .sub-hint { font-size: 10px; color: #64748b; margin-top: 2px; }
        .footer {
            border-top: 1px solid #1e293b;
            padding: 24px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
        }
        .footer-note { font-family: monospace; font-size: 11px; color: #475569; margin-top: 4px; }
    </style>
</head>
<body>
    <div class="top-bar">
        <span>⚡ BazMart Supermarket Ecosystem</span>
        <span>•</span>
        <span dir="rtl">خێراترین مارکێتی ئۆنلاین لە کوردستان و عێراق (١٥-٢٠ خولەک)</span>
        <span>•</span>
        <span>Port Allocations: 4000 (Customer) • 4001 (API) • 4002 (Ops)</span>
    </div>

    <header class="header">
        <div class="brand">
            <div class="logo-box">BM</div>
            <div>
                <div style="display: flex; align-items: center;">
                    <span class="brand-title">BazMart</span>
                    <span class="badge-core">Core API</span>
                </div>
                <div class="sub-kurdish" dir="rtl">سیستەمی پێشکەوتووی داڕک ستۆر و گەیاندن</div>
            </div>
        </div>

        <div style="display: flex; align-items: center; gap: 12px;">
            <div class="status-pill">
                <div class="dot-green"></div>
                <span>Laravel 13 Enterprise Active (:4001)</span>
            </div>
            <a href="/api/v1/health" target="_blank" style="font-size: 12px; background: #1e293b; color: #cbd5e1; padding: 6px 12px; border-radius: 8px; font-weight: 600; border: 1px solid #334155;">
                API Health JSON &rarr;
            </a>
        </div>
    </header>

    <div class="container">
        <!-- Hero Card -->
        <div class="hero">
            <span class="hero-tag">✨ Talabat Mart 100% Feature Parity Stack</span>
            <h1 class="hero-title">BazMart Enterprise Services Gateway</h1>
            <p class="hero-desc">
                You are currently viewing the central Laravel 13 backend engine on <strong>port 4001</strong>.
                To experience BazMart, open either the customer mobile shopping app or the dark store operations dashboard:
            </p>
            <div class="btn-group">
                <a href="http://localhost:4002" class="btn-primary">
                    <span>🚀 Launch Admin & Dark Store Portal (:4002)</span>
                </a>
                <a href="http://localhost:4000" class="btn-secondary">
                    <span>🛍️ Launch Customer Mobile Web App (:4000)</span>
                </a>
            </div>
        </div>

        <!-- System Topology 3 Columns -->
        <div class="section-label">System Topology & Port Mapping</div>
        <div class="grid-3">
            <!-- 4000: Customer Web -->
            <div class="card">
                <div>
                    <div class="card-top">
                        <span class="card-icon">📱</span>
                        <span class="port-pill port-orange">:4000</span>
                    </div>
                    <div class="card-title">Customer Mobile Web App</div>
                    <div class="card-desc">
                        15-minute grocery shopping app built with Flutter Web. Category drawer, instant search, BazMart Wallet, Sorani Kurdish localization & address picker.
                    </div>
                    <ul class="card-checklist">
                        <li><span class="check-green">✓</span> Guest-to-account cart & favorites sync</li>
                        <li><span class="check-green">✓</span> IQD 5,000 Wallet balance checkout</li>
                        <li><span class="check-green">✓</span> Item replacement rules & rider tip chips</li>
                    </ul>
                </div>
                <a href="http://localhost:4000" class="card-btn">Open Customer App (:4000) &rarr;</a>
            </div>

            <!-- 4002: Operations Portal -->
            <div class="card">
                <div>
                    <div class="card-top">
                        <span class="card-icon">⚡</span>
                        <span class="port-pill port-purple">:4002</span>
                    </div>
                    <div class="card-title">Operations & Admin Portal</div>
                    <div class="card-desc">
                        Real-time operations center built with Next.js 14. Live Kanban dispatch under 3 minutes, FEFO batch expiry radar, double-entry ledger & support ticket center.
                    </div>
                    <ul class="card-checklist">
                        <li><span class="check-green">✓</span> 3-minute barcode packing queue</li>
                        <li><span class="check-green">✓</span> FEFO expiry radar & 1-click discount sale</li>
                        <li><span class="check-green">✓</span> 1-Click wallet refund customer support</li>
                    </ul>
                </div>
                <a href="http://localhost:4002" class="card-btn">Open Operations Portal (:4002) &rarr;</a>
            </div>

            <!-- 4001: Laravel API -->
            <div class="card">
                <div>
                    <div class="card-top">
                        <span class="card-icon">🛡️</span>
                        <span class="port-pill port-green">:4001 (This Host)</span>
                    </div>
                    <div class="card-title">Laravel 13 API Backend</div>
                    <div class="card-desc">
                        High-velocity REST API with atomic database transactions, OTP phone authentication, automated restocking alerts & double-entry COGS ledger.
                    </div>
                    <ul class="card-checklist">
                        <li><span class="check-green">✓</span> 100% PHPUnit feature test coverage</li>
                        <li><span class="check-green">✓</span> Strict port safety: Port 3000 untouched</li>
                        <li><span class="check-green">✓</span> Supermarket margin math: 22%–30%</li>
                    </ul>
                </div>
                <a href="/api/v1/catalog" target="_blank" class="card-btn">Inspect Catalog API Feed (:4001) &rarr;</a>
            </div>
        </div>

        <!-- Direct Submodule Links -->
        <div class="section-label">Direct Deep-Links to Admin Submodules (:4002)</div>
        <div class="grid-submodules">
            <a href="http://localhost:4002/orders" class="sub-link">
                <div class="sub-icon">📦</div>
                <div class="sub-name">Dark Store Dispatch</div>
                <div class="sub-hint">Live Kanban Board</div>
            </a>
            <a href="http://localhost:4002/supply-chain" class="sub-link">
                <div class="sub-icon">⏳</div>
                <div class="sub-name">Supply Chain & FEFO</div>
                <div class="sub-hint">Expiry Radar</div>
            </a>
            <a href="http://localhost:4002/support" class="sub-link">
                <div class="sub-icon">🎧</div>
                <div class="sub-name">Support & Refunds</div>
                <div class="sub-hint">Wallet Credits</div>
            </a>
            <a href="http://localhost:4002/finance" class="sub-link">
                <div class="sub-icon">📈</div>
                <div class="sub-name">Finance & P&L</div>
                <div class="sub-hint">Double-Entry Ledger</div>
            </a>
            <a href="http://localhost:4002/driver-portal" class="sub-link">
                <div class="sub-icon">🛵</div>
                <div class="sub-name">Driver Portal</div>
                <div class="sub-hint">Rider App View</div>
            </a>
            <a href="http://localhost:4002/fleet" class="sub-link">
                <div class="sub-icon">💵</div>
                <div class="sub-name">Fleet & COD Cash</div>
                <div class="sub-hint">Shift Settle</div>
            </a>
        </div>
    </div>

    <footer class="footer">
        <div>BazMart Enterprise Supermarket & Dark Store Infrastructure • Kurdistan Region & Iraq Market</div>
        <div class="footer-note">Strict Machine Standard: Port 3000 Reserved & Protected</div>
    </footer>
</body>
</html>
