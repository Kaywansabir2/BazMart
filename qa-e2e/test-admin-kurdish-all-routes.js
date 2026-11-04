const { chromium } = require('playwright');
const { spawn, execSync } = require('child_process');
const http = require('http');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const phpPath = 'C:\\Users\\zakar\\AppData\\Local\\Microsoft\\WinGet\\Packages\\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe';

function killPorts() {
  const ports = [4001, 4002];
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

  console.log('Starting Laravel on :4001...');
  const php = spawn('cmd.exe', ['/c', `set PATH=${phpPath};%PATH% && php artisan serve --host=127.0.0.1 --port=4001`], {
    cwd: path.join(rootDir, 'backend-laravel'),
    stdio: 'ignore'
  });

  console.log('Starting Next.js on :4002...');
  const next = spawn('cmd.exe', ['/c', 'npx next start -p 4002'], {
    cwd: path.join(rootDir, 'admin-web'),
    stdio: 'ignore'
  });

  let browser;
  try {
    await wait(4001);
    console.log('[OK] 4001 UP');
    await wait(4002);
    console.log('[OK] 4002 UP');

    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 }
    });

    const crashes = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`[CONSOLE ERROR]: ${msg.text()}`);
      }
    });
    page.on('pageerror', err => {
      console.error('[PAGE_ERROR]:', err.message, '\nStack:', err.stack);
      crashes.push(err.message);
    });

    const routes = [
      '/',
      '/orders',
      '/finance',
      '/catalog',
      '/supply-chain',
      '/erp-sync',
      '/fleet',
      '/staff',
      '/support',
      '/customers',
      '/coupons',
      '/ratings',
      '/driver-portal',
      '/settings'
    ];

    // Visit home page first and switch to Kurdish
    console.log('\n=== Loading home and switching language to Kurdish (کوردی) ===');
    await page.goto('http://localhost:4002/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    const ckbBtn = await page.$('button:has-text("کوردی")');
    if (ckbBtn) {
      await ckbBtn.click();
      await page.waitForTimeout(1000);
      console.log('[OK] Switched to Kurdish (ckb)');
    }

    for (const r of routes) {
      console.log('\n=== TESTING KURDISH ROUTE:', r);
      await page.goto('http://localhost:4002' + r, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1500);

      // Verify language toggle is still ckb or click ckb if needed
      const ckbBtnRoute = await page.$('button:has-text("کوردی")');
      if (ckbBtnRoute) {
        await ckbBtnRoute.click();
        await page.waitForTimeout(1000);
      }

      const text = await page.innerText('body');
      if (text.includes('Application error: a client-side exception')) {
        console.error('*** CRASH DETECTED ON ROUTE ' + r + ' IN KURDISH ***');
        crashes.push('CRASH ON ' + r);
      } else {
        console.log('PASS:', r);
      }
    }

    if (crashes.length > 0) {
      console.error('\n>>> TOTAL CRASHES FOUND IN KURDISH:', crashes.length, JSON.stringify(crashes));
    } else {
      console.log('\n>>> ALL 14 ROUTES PASSED IN KURDISH WITHOUT ANY CLIENT-SIDE CRASH!');
    }
  } catch (e) {
    console.error('FAIL IN TEST RUNNER:', e);
  } finally {
    if (browser) await browser.close();
    console.log('Terminating processes...');
    killPorts();
    console.log('Cleanup complete.');
  }
}
main();

