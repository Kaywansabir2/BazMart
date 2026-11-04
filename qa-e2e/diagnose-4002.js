const { chromium } = require('playwright');
const { spawn, execSync } = require('child_process');
const http = require('http');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const phpPath = 'C:\\Users\\zakar\\AppData\\Local\\Microsoft\\WinGet\\Packages\\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe';

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

function checkHttp(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  killPorts();

  console.log('Starting Laravel (:4001)...');
  const laravelProc = spawn('cmd.exe', ['/c', `set PATH=${phpPath};%PATH% && php artisan serve --host=127.0.0.1 --port=4001`], {
    cwd: path.join(rootDir, 'backend-laravel'),
    stdio: 'ignore',
  });

  console.log('Starting Next.js (:4002)...');
  const nextProc = spawn('cmd.exe', ['/c', 'npx next start -p 4002'], {
    cwd: path.join(rootDir, 'admin-web'),
    stdio: 'ignore',
  });

  console.log('Waiting for servers to become ready...');
  for (let i = 0; i < 25; i++) {
    const laravelUp = await checkHttp('http://127.0.0.1:4001/api/v1/health');
    const nextUp = await checkHttp('http://127.0.0.1:4002');
    if (laravelUp && nextUp) {
      console.log(`Both servers up! (attempt ${i})`);
      break;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  const errors = [];
  page.on('pageerror', (err) => {
    errors.push(`[PAGE ERROR]: ${err.message}`);
  });

  const routesToTest = [
    '/',
    '/orders',
    '/supply-chain',
    '/support',
    '/finance',
    '/customers',
    '/coupons',
    '/catalog',
    '/fleet',
    '/driver-portal',
  ];

  console.log('\nTesting Next.js routes on http://localhost:4002 ...');
  for (const r of routesToTest) {
    const target = `http://localhost:4002${r}`;
    try {
      const resp = await page.goto(target, { waitUntil: 'load', timeout: 10000 });
      await page.waitForTimeout(1500);
      console.log(`✓ ${r.padEnd(16)} -> HTTP ${resp.status()} | Title: ${await page.title()}`);
    } catch (e) {
      console.error(`✗ ${r.padEnd(16)} -> FAILED: ${e.message}`);
      errors.push(`${r}: ${e.message}`);
    }
  }

  console.log('\nTesting Laravel Gateway on http://localhost:4001 ...');
  try {
    const resp = await page.goto('http://localhost:4001', { waitUntil: 'load', timeout: 10000 });
    console.log(`✓ Laravel /      -> HTTP ${resp.status()} | Title: ${await page.title()}`);
  } catch (e) {
    console.error('✗ Laravel Gateway failed:', e.message);
  }

  await browser.close();
  try { laravelProc.kill(); } catch {}
  try { nextProc.kill(); } catch {}
  killPorts();

  if (errors.length > 0) {
    console.error('\nTotal errors encountered:', errors);
    process.exit(1);
  } else {
    console.log('\n✓ ALL ROUTES PASSED WITH ZERO CLIENT-SIDE EXCEPTIONS!');
    process.exit(0);
  }
}

main().catch(console.error);
