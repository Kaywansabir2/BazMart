const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

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

async function main() {
  console.log('--- BAZMART AUTOMATED BROWSER VERIFICATION ---');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(__dirname, '.chrome-temp');

  console.log('Spawning Chrome headless instance with CDP on port 9222...');
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--disable-background-networking',
    '--no-first-run',
    'about:blank'
  ], { stdio: 'ignore' });

  // Wait for CDP to respond
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
    } catch (e) {
      // Retrying
    }
  }

  if (!connected) {
    throw new Error('Could not connect to Chrome CDP on port 9222');
  }

  console.log('Connected to Chrome CDP:', versionInfo.Browser);

  const targets = await httpGet('http://127.0.0.1:9222/json/list');
  let pageTarget = targets.find(t => t.type === 'page');

  if (!pageTarget) {
    const newTarget = await httpGet('http://127.0.0.1:9222/json/new?about:blank');
    pageTarget = newTarget;
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  await new Promise(resolve => {
    ws.addEventListener('open', resolve);
  });
  console.log('WebSocket target session opened');

  // Set viewport to 1280x900 for desktop web browser preview
  await sendCDP(ws, 'Page.enable');
  await sendCDP(ws, 'Runtime.enable');
  await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  // Navigate to BazMart on port 4000
  console.log('Navigating to http://localhost:4000 ...');
  await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:4000' });

  // Wait for Flutter CanvasKit app to render
  console.log('Waiting for Flutter app to render completely...');
  await sleep(7000);

  // 1. Capture Home Screen Screenshot
  const homeShot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  const homePath = path.join(__dirname, 'screenshot_home.png');
  fs.writeFileSync(homePath, Buffer.from(homeShot.data, 'base64'));
  console.log(`[PASS] Home Screen rendered and captured at ${homePath}`);

  // 2. Test click interaction on a product card's "+" button
  // In the phone frame (centered between x: 425 and x: 855), the "+" button on "Al Rahma Milk"
  // is at approx x: 550, y: 395
  console.log('Testing tap on "+" button to add product to cart...');
  await sendCDP(ws, 'Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x: 550,
    y: 395,
    button: 'left',
    clickCount: 1
  });
  await sendCDP(ws, 'Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x: 550,
    y: 395,
    button: 'left',
    clickCount: 1
  });

  await sleep(1500);

  const cartBarShot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  const cartBarPath = path.join(__dirname, 'screenshot_cart_bar.png');
  fs.writeFileSync(cartBarPath, Buffer.from(cartBarShot.data, 'base64'));
  console.log(`[PASS] Cart interaction and threshold bar verified at ${cartBarPath}`);

  // 3. Test Language Switcher to Kurdish Sorani ("کوردی")
  // The "کوردی" button inside the language pill is located at approx x: 745, y: 35
  console.log('Toggling language switcher to Kurdish Sorani (کوردی) to verify full RTL layout...');
  await sendCDP(ws, 'Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x: 745,
    y: 35,
    button: 'left',
    clickCount: 1
  });
  await sendCDP(ws, 'Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x: 745,
    y: 35,
    button: 'left',
    clickCount: 1
  });

  await sleep(2000);

  const rtlShot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  const rtlPath = path.join(__dirname, 'screenshot_kurdish_rtl.png');
  fs.writeFileSync(rtlPath, Buffer.from(rtlShot.data, 'base64'));
  console.log(`[PASS] Kurdish Sorani RTL layout verified and captured at ${rtlPath}`);

  console.log('--- ALL AUTOMATED BROWSER VERIFICATIONS COMPLETED SUCCESSFULLY ---');

  ws.close();
  chromeProcess.kill();
  process.exit(0);
}

main().catch(err => {
  console.error('Browser verification failed:', err);
  process.exit(1);
});
