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
  console.log('BazMart Step 12: Automated Option C Playwright Runner');
  console.log('Strict Port Safety: 4000, 4001, 4002 only. Port 3000 UNTOUCHED!');
  console.log('============================================================');

  console.log('Cleaning existing processes on 4000, 4001, 4002...');
  killPorts();

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

  console.log('[3/3] Starting Next.js Admin on :4002...');
  const admin = spawn('cmd.exe', ['/c', 'npm run dev -- -p 4002'], {
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
  if (ready) {
    console.log('\n>>> Running Option C Playwright Test Suite <<<');
    try {
      execSync('npx playwright test tests/step12-financial-accounting.spec.ts --reporter=list', {
        cwd: __dirname,
        stdio: 'inherit'
      });
      code = 0;
    } catch (e) {
      code = e.status || 1;
    }
  } else {
    console.error('ERROR: Servers did not reach healthy state in time.');
  }

  console.log('\nCleaning up all test processes...');
  try { process.kill(laravel.pid); } catch {}
  try { process.kill(customer.pid); } catch {}
  try { process.kill(admin.pid); } catch {}
  killPorts();
  console.log('✓ Cleaned up all test servers. Zero lingering background tasks.');
  process.exit(code);
}

main();

