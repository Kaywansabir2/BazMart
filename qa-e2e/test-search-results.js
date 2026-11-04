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

    // 1. Initial Search Screen (Empty query, Kurdish chips, Back Chevron)
    await page.goto('http://localhost:4000/?lang=ckb&route=search', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await page.waitForTimeout(5000);

    const initialShot = path.join(__dirname, 'customer_search_initial_verified.png');
    await page.screenshot({ path: initialShot, fullPage: true });
    fs.copyFileSync(initialShot, path.join(artifactsDir, 'customer_search_initial_verified.png'));
    console.log('[PASS] Initial search screenshot saved:', initialShot);

    // 2. Active Search Screen for "شیر" (Milk)
    const encodedQuery = encodeURIComponent('شیر');
    await page.goto(`http://localhost:4000/?lang=ckb&route=search&q=${encodedQuery}`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await page.waitForTimeout(6000);

    const resultsShot = path.join(__dirname, 'customer_search_results_ckb_verified.png');
    await page.screenshot({ path: resultsShot, fullPage: true });
    fs.copyFileSync(resultsShot, path.join(artifactsDir, 'customer_search_results_ckb_verified.png'));
    console.log('[PASS] Results search screenshot saved:', resultsShot);

  } catch (err) {
    console.error('Error in Playwright test:', err);
  } finally {
    if (browser) await browser.close();
    killPorts();
  }
}

main();
