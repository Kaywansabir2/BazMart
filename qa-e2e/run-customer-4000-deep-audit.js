const { spawn, execSync } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const phpPath = 'C:\\tools\\php;C:\\Users\\zakar\\AppData\\Local\\Microsoft\\WinGet\\Packages\\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe';
const artifactsDir = 'C:\\Users\\zakar\\.gemini\\antigravity\\brain\\d845ab7d-bb3d-4afb-95c7-fae336c7fcef';
const screenshotDir = path.join(__dirname, 'audit-screenshots', 'customer-4000-deep-audit');

function killPorts() {
  const ports = [4000, 4001];
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
  console.log('============================================================');
  console.log('BazMart Customer App (:4000) Master Deep UI/UX Audit Runner');
  console.log('Target Ports: Customer :4000, Laravel API :4001');
  console.log('Port 3000: Strictly Untouched and Protected');
  console.log('============================================================');

  console.log('Cleaning existing processes on 4000 & 4001...');
  killPorts();

  let laravel, customer;
  try {
    console.log('[1/2] Starting Laravel API on :4001...');
    laravel = spawn('cmd.exe', ['/c', `set PATH=${phpPath};%PATH% && php artisan serve --host=127.0.0.1 --port=4001`], {
      cwd: path.join(rootDir, 'backend-laravel'),
      stdio: 'ignore',
    });

    console.log('[2/2] Starting Customer Web on :4000...');
    customer = spawn('node', ['server.js'], {
      cwd: path.join(rootDir, 'mobile-app'),
      stdio: 'ignore',
    });

    let ready = false;
    console.log('Waiting for servers to become ready...');
    for (let i = 1; i <= 35; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const [h4001, h4000] = await Promise.all([
        checkHttp('http://127.0.0.1:4001/api/v1/health'),
        checkHttp('http://127.0.0.1:4000'),
      ]);

      if (i % 3 === 0) {
        console.log(`Check ${i}/35: 4001=${h4001}, 4000=${h4000}`);
      }

      if (h4001 && h4000) {
        ready = true;
        console.log('✓ Both servers are HEALTHY and responding!');
        break;
      }
    }

    if (!ready) {
      console.error('Servers failed to initialize within timeout.');
      process.exit(1);
    }

    console.log('\n>>> EXECUTING 35-STATE PLAYWRIGHT AUDIT SUITE <<<\n');
    execSync('npx playwright test tests/customer-app-4000-exhaustive-ui-audit.spec.ts', {
      cwd: __dirname,
      stdio: 'inherit',
    });

    console.log('\n>>> VERIFYING CAPTURED ARTIFACTS <<<\n');
    if (fs.existsSync(screenshotDir)) {
      const files = fs.readdirSync(screenshotDir).filter(f => f.endsWith('.png'));
      console.log(`Found ${files.length} screenshots in ${screenshotDir}:`);
      files.forEach(f => console.log(`  - ${f}`));
    }
  } catch (err) {
    console.error('Error during test execution:', err.message);
  } finally {
    console.log('\nCleaning up server processes on 4000 & 4001 (Zero Daemon Leak)...');
    killPorts();
    if (laravel) { try { laravel.kill(); } catch {} }
    if (customer) { try { customer.kill(); } catch {} }
    console.log('✓ All test servers cleanly terminated. Port 3000 untouched.\n');
  }
}

main();

