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

function wait(port, timeout = 25000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const c = () => {
      const req = http.get('http://localhost:' + port + '/', () => resolve());
      req.on('error', () => {
        if (Date.now() - start > timeout) reject(new Error('Timeout ' + port));
        else setTimeout(c, 500);
      });
    };
    c();
  });
}

async function main() {
  killPorts();

  const php = spawn('cmd.exe', ['/c', `set PATH=${phpPath};%PATH% && php artisan serve --host=127.0.0.1 --port=4001`], {
    cwd: path.join(rootDir, 'backend-laravel'),
    stdio: 'ignore'
  });

  const customer = spawn('node', ['server.js'], {
    cwd: path.join(rootDir, 'mobile-app'),
    stdio: 'ignore'
  });

  let browser;
  try {
    await wait(4001);
    await wait(4000);

    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const page = await browser.newPage({
      viewport: { width: 412, height: 892 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
    });

    // 1. Guest Profile Screen
    await page.goto('http://localhost:4000/?lang=ckb&route=profile', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await page.waitForTimeout(5000);

    const guestShot = path.join(__dirname, 'customer_profile_guest_verified.png');
    await page.screenshot({ path: guestShot, fullPage: true });
    fs.copyFileSync(guestShot, path.join(artifactsDir, 'customer_profile_guest_verified.png'));
    console.log('[PASS] Guest Profile screenshot saved:', guestShot);

    // 2. Logged In Profile Screen (VIP Test Account: Ako Muhamad with 25,000 IQD wallet & orders)
    await page.goto('http://localhost:4000/?lang=ckb&route=profile&auth_phone=%2B9647701234567', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await page.waitForTimeout(6000);

    const loggedInShot = path.join(__dirname, 'customer_profile_logged_in_verified.png');
    await page.screenshot({ path: loggedInShot, fullPage: true });
    fs.copyFileSync(loggedInShot, path.join(artifactsDir, 'customer_profile_logged_in_verified.png'));
    console.log('[PASS] Logged-in Profile screenshot saved:', loggedInShot);

    // 3. Auth Flow Screen
    await page.goto('http://localhost:4000/?lang=ckb&route=auth', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await page.waitForTimeout(4000);

    const authShot = path.join(__dirname, 'customer_auth_sheet_verified.png');
    await page.screenshot({ path: authShot, fullPage: true });
    fs.copyFileSync(authShot, path.join(artifactsDir, 'customer_auth_sheet_verified.png'));
    console.log('[PASS] Auth screen screenshot saved:', authShot);

  } catch (err) {
    console.error('Error in Playwright test:', err);
  } finally {
    if (browser) await browser.close();
    killPorts();
  }
}

main();
