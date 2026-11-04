const { chromium } = require('playwright');
const { spawn } = require('child_process');
const http = require('http');

function waitForPort(port, timeoutMs = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(`http://localhost:${port}/`, (res) => {
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Timeout waiting for port ${port}`));
        } else {
          setTimeout(check, 500);
        }
      });
    };
    check();
  });
}

async function run() {
  console.log('[DEBUG] Starting Next.js on port 4002...');
  const nextProc = spawn('cmd.exe', ['/c', 'npx', 'next', 'start', '-p', '4002'], {
    cwd: 'c:\\Users\\zakar\\BazMart\\admin-web',
    stdio: 'pipe',
  });

  nextProc.stdout.on('data', (d) => console.log('[NEXT STDOUT]:', d.toString().trim()));
  nextProc.stderr.on('data', (d) => console.error('[NEXT STDERR]:', d.toString().trim()));

  try {
    await waitForPort(4002, 25000);
    console.log('[DEBUG] Port 4002 is UP!');

    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    const page = await browser.newPage();

    const errors = [];
    page.on('console', (msg) => {
      console.log(`[BROWSER CONSOLE] [${msg.type()}]: ${msg.text()}`);
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', (err) => {
      console.log(`[BROWSER PAGEERROR]: ${err.message}\n${err.stack}`);
      errors.push(err.message + '\n' + err.stack);
    });

    const routes = [
      '/',
      '/orders',
      '/supply-chain',
      '/support',
      '/finance',
      '/ratings',
      '/customers',
      '/coupons',
      '/catalog',
      '/erp-sync',
      '/campaigns',
      '/fleet',
      '/driver-portal',
      '/settings',
    ];

    for (const route of routes) {
      console.log(`\n--- TESTING ROUTE: ${route} ---`);
      try {
        await page.goto(`http://localhost:4002${route}`, { waitUntil: 'networkidle', timeout: 8000 });
        await page.waitForTimeout(1000);
        const bodyText = await page.innerText('body');
        if (bodyText.includes('Application error: a client-side exception')) {
          console.error(`[CRASH FOUND ON ROUTE: ${route}]`);
        } else {
          console.log(`[ROUTE OK: ${route}]`);
        }
      } catch (e) {
        console.error(`[ERROR NAVIGATING TO ${route}]:`, e.message);
      }
    }

    await browser.close();
  } catch (err) {
    console.error('[RUN ERROR]:', err);
  } finally {
    console.log('[DEBUG] Killing Next.js process...');
    spawn('taskkill', ['/F', '/T', '/PID', nextProc.pid.toString()]);
    console.log('[DEBUG] Done.');
  }
}

run();
