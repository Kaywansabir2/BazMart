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
  console.log('============================================================');
  console.log('BazMart Step 13: Supply Chain, PO & FEFO Expiry Radar Audit');
  console.log('Target Ports: Customer :4000, Laravel :4001, Admin :4002');
  console.log('Port 3000: Strictly Untouched and Protected');
  console.log('============================================================');

  console.log('Cleaning existing processes on 4000, 4001, 4002...');
  killPorts();

  console.log('Seeding pristine database for Step 13 audit...');
  try {
    execSync(`set PATH=${phpPath};%PATH% && php artisan migrate:fresh --seed`, {
      cwd: path.join(rootDir, 'backend-laravel'),
      stdio: 'inherit'
    });
  } catch (e) {
    console.error('Migration error:', e);
  }

  console.log('[1/3] Starting Laravel API on :4001...');
  const laravel = spawn('cmd.exe', ['/c', `set PATH=${phpPath};%PATH% && php artisan serve --host=127.0.0.1 --port=4001`], {
    cwd: path.join(rootDir, 'backend-laravel'),
    detached: false,
    stdio: 'ignore'
  });

  console.log('[2/3] Starting Customer Web on :4000...');
  const customer = spawn('node', ['server.js'], {
    cwd: path.join(rootDir, 'mobile-app'),
    detached: false,
    stdio: 'ignore'
  });

  console.log('[3/3] Starting Next.js Admin on :4002 (Production Start)...');
  const admin = spawn('cmd.exe', ['/c', 'npx next start -p 4002'], {
    cwd: path.join(rootDir, 'admin-web'),
    detached: false,
    stdio: 'ignore'
  });

  let ready = false;
  console.log('Waiting for servers to become ready...');
  for (let i = 1; i <= 35; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const [h4001, h4000, h4002] = await Promise.all([
      checkHttp('http://127.0.0.1:4001/api/v1/health'),
      checkHttp('http://127.0.0.1:4000'),
      checkHttp('http://127.0.0.1:4002')
    ]);

    if (i % 3 === 0) {
      console.log(`Check ${i}/35: 4001=${h4001}, 4000=${h4000}, 4002=${h4002}`);
    }

    if (h4001 && h4000 && h4002) {
      ready = true;
      console.log('✓ All 3 servers are HEALTHY and responding!');
      break;
    }
  }

  let code = 1;
  if (!ready) {
    console.error('Servers failed to initialize within timeout.');
  } else {
    console.log('\n>>> RUNNING STEP 13 PLAYWRIGHT E2E TEST SUITE <<<\n');
    try {
      execSync('npx playwright test tests/step13-supply-chain-and-fixes.spec.ts', {
        cwd: __dirname,
        stdio: 'inherit'
      });
      code = 0;
      console.log('\n✓ ALL STEP 13 TESTS PASSED SUCCESSFULLY WITH OPTION C!');
    } catch (e) {
      console.error('\n✗ Step 13 Playwright test suite encountered failures:', e.status);
      code = e.status || 1;
    }
  }

  console.log('\nTearing down ephemeral test processes (enforcing 0 background tasks)...');
  killPorts();
  try { laravel.kill(); } catch {}
  try { customer.kill(); } catch {}
  try { admin.kill(); } catch {}

  console.log('Teardown complete. Exiting with code:', code);
  process.exit(code);
}

main().catch(err => {
  console.error('Fatal error:', err);
  killPorts();
  process.exit(1);
});

