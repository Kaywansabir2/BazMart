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

  // 1. CAPTURE CATEGORY PRODUCTS SCREEN VIA SEARCH CATEGORY TILE
  console.log('Navigating to http://localhost:4000 ...');
  await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:4000' });
  await sleep(7000);

  // Open SearchScreen (search bar at x: 600, y: 65)
  await clickAt(ws, 600, 65);
  await sleep(2500);

  // Tap "Fruit & Veg" quick tile on SearchScreen (x: 500, y: 280)
  console.log('Tapping Fruit & Veg quick tile on SearchScreen ...');
  await clickAt(ws, 500, 280);
  await sleep(2500);
  await saveScreenshot(ws, 'step2_02_category_screen.png');

  // Return to Home
  await clickAt(ws, 450, 35);
  await sleep(1500);
  await clickAt(ws, 450, 35);
  await sleep(1500);

  // 2. CAPTURE KURDISTAN PRODUCTS SCREEN
  // Scroll down to "Around the world"
  console.log('Scrolling to Around the World flags ...');
  await sendCDP(ws, 'Input.dispatchMouseEvent', {
    type: 'mouseWheel',
    x: 640,
    y: 500,
    deltaX: 0,
    deltaY: 1000
  });
  await sleep(2000);

  // Click on Kurdistan circular flag
  // Let's see the flag position on screen after scroll: center x ~ 480, y ~ 620
  await clickAt(ws, 480, 620);
  await sleep(2500);
  await saveScreenshot(ws, 'step2_04_country_screen.png');

  console.log('Done capturing remaining screens.');
  ws.close();
  chromeProcess.kill();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

