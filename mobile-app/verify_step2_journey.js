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
  console.log(`[SAVED] ${filename} (${buffer.length} bytes)`);
}

async function main() {
  console.log('--- STARTING STEP 2 CUSTOMER JOURNEY VERIFICATION ---');

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

  // 1. HOME SCREEN LOAD
  console.log('1. Navigating to http://localhost:4000 ...');
  await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:4000' });
  await sleep(7500);

  // 2. OPEN SEARCH SCREEN (Tapping the search bar at x: 600, y: 65)
  console.log('2. Tapping Search Bar to open SearchScreen ...');
  await clickAt(ws, 600, 65);
  await sleep(2500);
  await saveScreenshot(ws, 'step2_01_search_screen_initial.png');

  // Type "Milk" into search bar
  console.log('Typing "Milk" into live search input ...');
  await sendCDP(ws, 'Input.insertText', { text: 'Milk' });
  await sleep(2500);
  await saveScreenshot(ws, 'step2_01_search_screen_results.png');

  // Go back to Home (chevron at x: 450, y: 35)
  console.log('Returning to Home Screen ...');
  await clickAt(ws, 450, 35);
  await sleep(2000);

  // 3. OPEN CATEGORY PRODUCTS SCREEN (Clicking "Fruit & Veg" at x: 480, y: 530)
  console.log('3. Tapping "Fruit & Veg" Category tile ...');
  await clickAt(ws, 480, 530);
  await sleep(2500);
  await saveScreenshot(ws, 'step2_02_category_screen.png');

  // Return to Home
  console.log('Returning to Home Screen ...');
  await clickAt(ws, 450, 35);
  await sleep(2000);

  // 4. OPEN BRAND STORE SCREEN (Clicking "Maggi" brand tile at x: 480, y: 780 or scroll)
  // Let's scroll down to Shop by Brand
  console.log('4. Scrolling to Shop by Brand and Around the World ...');
  await sendCDP(ws, 'Input.dispatchMouseEvent', {
    type: 'mouseWheel',
    x: 640,
    y: 500,
    deltaX: 0,
    deltaY: 500
  });
  await sleep(1500);

  // Click on Maggi brand tile at x: 480, y: 480
  console.log('Clicking Maggi Brand tile ...');
  await clickAt(ws, 480, 480);
  await sleep(2500);
  await saveScreenshot(ws, 'step2_03_brand_store_screen.png');

  // Return to Home
  console.log('Returning to Home Screen ...');
  await clickAt(ws, 450, 35);
  await sleep(2000);

  // 5. OPEN COUNTRY SCREEN (Kurdistan Flag)
  console.log('5. Clicking Kurdistan Region Flag in Around the World ...');
  // Scroll slightly down to flags
  await sendCDP(ws, 'Input.dispatchMouseEvent', {
    type: 'mouseWheel',
    x: 640,
    y: 500,
    deltaX: 0,
    deltaY: 600
  });
  await sleep(1500);

  // Click on Kurdistan Flag at x: 480, y: 490
  await clickAt(ws, 480, 490);
  await sleep(2500);
  await saveScreenshot(ws, 'step2_04_country_screen.png');

  // Return to Home
  console.log('Returning to Home Screen ...');
  await clickAt(ws, 450, 35);
  await sleep(2000);

  // 6. ADD 4 UNITS OF AL RAHMA MILK (4 * 2250 = IQD 9000, EXCEEDING IQD 7000 MINIMUM)
  console.log('6. Adding 4 units of Al Rahma Milk to cart ...');
  // Scroll back to top
  await sendCDP(ws, 'Input.dispatchMouseEvent', {
    type: 'mouseWheel',
    x: 640,
    y: 500,
    deltaX: 0,
    deltaY: -1500
  });
  await sleep(1500);

  // Open Product Detail Screen for Al Rahma Milk (x: 500, y: 420)
  await clickAt(ws, 500, 420);
  await sleep(2500);

  // Add 4 units on PDP (Add to cart at x: 800, y: 965)
  for (let i = 0; i < 4; i++) {
    await clickAt(ws, 800, 965);
    await sleep(600);
  }

  // Go back to Home
  await clickAt(ws, 450, 35);
  await sleep(2000);

  // Open Cart Screen via View cart button (x: 640, y: 965)
  console.log('Opening Cart Screen ...');
  await clickAt(ws, 640, 965);
  await sleep(2500);

  // Click Checkout button to open CheckoutScreen (x: 640, y: 960)
  console.log('Proceeding to CheckoutScreen ...');
  await clickAt(ws, 640, 960);
  await sleep(2500);
  await saveScreenshot(ws, 'step2_05_checkout_screen.png');

  // 7. PLACE ORDER ON CHECKOUT SCREEN
  console.log('7. Placing Order with Cash on Delivery (COD) ...');
  // Bottom Place Order button is at x: 640, y: 960
  await clickAt(ws, 640, 960);
  await sleep(3500); // Wait for API response and navigation
  await saveScreenshot(ws, 'step2_06_order_tracking_screen.png');

  console.log('--- ALL STEP 2 SCREENSHOTS CAPTURED AND STORED SUCCESSFULLY ---');
  ws.close();
  chromeProcess.kill();
  process.exit(0);
}

main().catch(err => {
  console.error('Error during step 2 capture:', err);
  process.exit(1);
});

