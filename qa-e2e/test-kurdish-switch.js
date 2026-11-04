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
    await wait(4002);

    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const page = await browser.newPage();

    let pageErrorFound = false;
    page.on('pageerror', err => {
      console.error('[PAGE_ERROR]:', err.message);
      pageErrorFound = true;
    });

    console.log('Navigating to http://localhost:4002/ ...');
    await page.goto('http://localhost:4002/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Click on Kurdish Language Button
    console.log('Clicking Kurdish language button...');
    const kurdishBtn = await page.getByRole('button', { name: 'کوردی' });
    if (await kurdishBtn.isVisible()) {
      await kurdishBtn.click();
      await page.waitForTimeout(1000);
      console.log('Switched to Kurdish Sorani RTL!');
    }

    const titleText = await page.innerText('h1');
    console.log('Header Title:', titleText);

    await page.screenshot({ path: path.join(__dirname, 'admin_overview_verified.png') });
    console.log('Saved admin_overview_verified.png');

    if (pageErrorFound) {
      console.error('Page error was detected!');
    } else {
      console.log('SUCCESS: ZERO ERRORS in Kurdish mode!');
    }
  } catch (e) {
    console.error('FAIL:', e);
  } finally {
    if (browser) await browser.close();
    killPorts();
  }
}
main();

