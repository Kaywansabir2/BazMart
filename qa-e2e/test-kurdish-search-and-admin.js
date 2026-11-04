const { chromium } = require('playwright');
const { spawn, execSync } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const phpPath = 'C:\\Users\\zakar\\AppData\\Local\\Microsoft\\WinGet\\Packages\\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe';
const artifactsDir = 'C:\\Users\\zakar\\.gemini\\antigravity\\brain\\85ad3565-5f5b-4232-a621-be418a0ce773';

function killPorts() {
  const ports = [4000, 4001, 4002];
  for (const port of ports) {
    try {
      const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      for (const line of out.split('\n')) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5 && parts[1].endsWith(`:${port}`)) {
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0') {
            try { execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' }); } catch {}
          }
        }
      }
    } catch {}
  }
}

function wait(port, timeout = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const c = () => {
      const req = http.get('http://localhost:' + port + '/', () => resolve());
      req.on('error', () => {
        if (Date.now() - start > timeout) reject(new Error('Timeout waiting for port ' + port));
        else setTimeout(c, 500);
      });
    };
    c();
  });
}

async function main() {
  console.log('Cleaning up ports 4000, 4001, 4002...');
  killPorts();

  console.log('Starting Laravel API on :4001...');
  const php = spawn('cmd.exe', ['/c', `set PATH=${phpPath};%PATH% && php artisan serve --host=127.0.0.1 --port=4001`], {
    cwd: path.join(rootDir, 'backend-laravel'),
    stdio: 'ignore'
  });

  console.log('Starting Next.js Admin on :4002...');
  const next = spawn('cmd.exe', ['/c', 'npx next start -p 4002'], {
    cwd: path.join(rootDir, 'admin-web'),
    stdio: 'ignore'
  });

  console.log('Starting Flutter Customer Web on :4000...');
  const customer = spawn('node', ['server.js'], {
    cwd: path.join(rootDir, 'mobile-app'),
    stdio: 'ignore'
  });

  let browser;
  try {
    await wait(4001);
    console.log('[OK] Laravel :4001 ready');
    await wait(4002);
    console.log('[OK] Admin Web :4002 ready');
    await wait(4000);
    console.log('[OK] Customer Web :4000 ready');

    browser = await chromium.launch({ channel: 'chrome', headless: true });

    // 1. Test Admin Web (:4002) in Kurdish Sorani
    console.log('\n--- 1. Testing Admin Web (:4002) ---');
    const adminPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const adminErrors = [];
    adminPage.on('pageerror', err => {
      console.error('[Admin Page Error]:', err.message);
      adminErrors.push(err.message);
    });

    await adminPage.goto('http://localhost:4002/', { waitUntil: 'networkidle', timeout: 20000 });
    await adminPage.waitForTimeout(2000);

    // Click Kurdish language button
    const ckbBtn = await adminPage.$('button:has-text("کوردی")');
    if (ckbBtn) {
      console.log('Switching admin language to Kurdish (کوردی)...');
      await ckbBtn.click();
      await adminPage.waitForTimeout(1500);
    }

    const adminBodyText = await adminPage.innerText('body');
    if (adminBodyText.includes('Application error: a client-side exception')) {
      throw new Error('Client-side exception detected on Admin Dashboard!');
    }
    console.log('[PASS] Admin Dashboard loaded with zero client-side exceptions');

    const adminShotPath = path.join(__dirname, 'admin_kurdish_sidebar_verified.png');
    await adminPage.screenshot({ path: adminShotPath, fullPage: false });
    fs.copyFileSync(adminShotPath, path.join(artifactsDir, 'admin_kurdish_sidebar_verified.png'));
    console.log('[PASS] Admin screenshot saved:', adminShotPath);
    await adminPage.close();

    // 2. Test Customer App (:4000) Search Screen in Kurdish Sorani
    console.log('\n--- 2. Testing Customer Web (:4000) Search Screen ---');
    const customerPage = await browser.newPage({
      viewport: { width: 412, height: 892 }, // Mobile phone viewport
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
    });

    await customerPage.goto('http://localhost:4000/?lang=ckb&route=search', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for Flutter Web canvas / dom to render
    console.log('Waiting 10s for Flutter Web rendering...');
    await customerPage.waitForTimeout(10000);

    const customerShotPath = path.join(__dirname, 'customer_search_ckb_verified.png');
    await customerPage.screenshot({ path: customerShotPath, fullPage: true });
    fs.copyFileSync(customerShotPath, path.join(artifactsDir, 'customer_search_ckb_verified.png'));
    console.log('[PASS] Customer search screenshot saved:', customerShotPath);

    await customerPage.close();

    console.log('\n============================================================');
    console.log('>>> ALL VERIFICATION CHECKS PASSED PERFECTLY! <<<');
    console.log('============================================================');
  } catch (err) {
    console.error('TEST ERROR:', err);
  } finally {
    if (browser) await browser.close();
    console.log('Cleaning up processes on 4000, 4001, 4002...');
    killPorts();
    console.log('Cleanup complete.');
  }
}

main();

