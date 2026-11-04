const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ARTIFACT_DIR = 'C:\\Users\\zakar\\.gemini\\antigravity\\brain\\85ad3565-5f5b-4232-a621-be418a0ce773';

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

function sendCDP(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === id) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function clickAt(ws, x, y) {
  await sendCDP(ws, 'Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  await sleep(80);
  await sendCDP(ws, 'Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x,
    y,
    button: 'left',
    buttons: 1,
    clickCount: 1
  });
  await sleep(80);
  await sendCDP(ws, 'Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x,
    y,
    button: 'left',
    buttons: 0,
    clickCount: 1
  });
}

async function saveScreenshot(ws, filename) {
  const shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(shot.data, 'base64');
  const targetPath = path.join(ARTIFACT_DIR, filename);
  fs.writeFileSync(targetPath, buffer);
  fs.writeFileSync(path.join(__dirname, filename), buffer);
  console.log(`Saved screenshot: ${filename} (${buffer.length} bytes)`);
}

async function main() {
  console.log('--- STARTING CLEAN FULL-SUITE SCREENSHOT CAPTURE ---');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(__dirname, '.chrome-temp');

  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--disable-background-networking',
    '--no-first-run',
    'about:blank'
  ], { stdio: 'ignore' });

  let connected = false;
  let versionInfo;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      versionInfo = await httpGet('http://127.0.0.1:9222/json/version');
      if (versionInfo && versionInfo.webSocketDebuggerUrl) {
        connected = true;
        break;
      }
    } catch (e) {}
  }

  if (!connected) throw new Error('Could not connect to Chrome CDP');

  const targets = await httpGet('http://127.0.0.1:9222/json/list');
  let pageTarget = targets.find(t => t.type === 'page');
  if (!pageTarget) {
    pageTarget = await httpGet('http://127.0.0.1:9222/json/new?about:blank');
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(resolve => ws.addEventListener('open', resolve));

  await sendCDP(ws, 'Page.enable');
  await sendCDP(ws, 'Runtime.enable');
  await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false
  });

  // STEP 1: HOME SCREEN (ENGLISH LTR)
  console.log('Step 1: Navigating to http://localhost:4000 ...');
  await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:4000' });
  await sleep(7500);
  await saveScreenshot(ws, '01_home_screen_en.png');

  // STEP 2: TOGGLE KURDISH SORANI (RTL)
  console.log('Step 2: Toggling to Kurdish Sorani (کوردی) ...');
  await clickAt(ws, 772, 22);
  await sleep(2500);
  await saveScreenshot(ws, '02_home_screen_kurdish_rtl.png');

  // STEP 3: RESET TO ENGLISH LTR VIA FRESH PAGE LOAD
  console.log('Step 3: Resetting to English LTR ...');
  await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:4000' });
  await sleep(6000);

  // STEP 4: OPEN PRODUCT DETAIL SCREEN (AL RAHMA MILK)
  console.log('Step 4: Opening Product Detail Screen ...');
  await clickAt(ws, 500, 420);
  await sleep(2500);
  await saveScreenshot(ws, '03_product_detail_screen.png');

  // STEP 5: ADD 4 UNITS (4 x IQD 2250 = IQD 9000, EXCEEDING IQD 7000 MINIMUM)
  console.log('Step 5: Adding 4 items to cart on Product Detail Screen ...');
  for (let i = 0; i < 4; i++) {
    await clickAt(ws, 800, 965);
    await sleep(600);
  }

  // STEP 6: NAVIGATE BACK TO HOME SCREEN
  console.log('Step 6: Navigating back to Home Screen ...');
  await clickAt(ws, 450, 35);
  await sleep(2500);
  await saveScreenshot(ws, '04_home_screen_with_cart_bar.png');

  // STEP 7: OPEN CART SCREEN VIA BOTTOM ORANGE BUTTON
  console.log('Step 7: Opening Cart Screen ...');
  await clickAt(ws, 640, 965);
  await sleep(2500);
  await saveScreenshot(ws, '05_cart_screen_checkout_active.png');

  // STEP 8: CLICK ORANGE CHECKOUT BUTTON TO TRIGGER COD CONFIRMATION
  console.log('Step 8: Clicking Checkout Button ...');
  await clickAt(ws, 640, 960);
  await sleep(2500);
  await saveScreenshot(ws, '06_order_confirmation_dialog.png');

  console.log('--- ALL 6 SCREENSHOTS PERFECTLY CAPTURED AND STORED ---');
  ws.close();
  chromeProcess.kill();
  process.exit(0);
}

main().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
