const fs = require('fs');
const path = require('path');
const https = require('https');

const targetDirs = [
  path.resolve(__dirname, '../backend-laravel/public/images/products'),
  path.resolve(__dirname, '../admin-web/public/images/products'),
  path.resolve(__dirname, '../mobile-app/web/assets/products'),
  path.resolve(__dirname, '../mobile-app/build/web/assets/products'),
];

targetDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const photos = {
  // Benchmark Products
  milk_alrahma: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&h=500&fit=crop&q=85',
  milk_ramak: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&h=500&fit=crop&q=85',
  eggs: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&h=500&fit=crop&q=85',
  milk_almarai: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=500&h=500&fit=crop&q=85',
  cucumber: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=500&h=500&fit=crop&q=85',
  pen: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&h=500&fit=crop&q=85',
  mountain_dew: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=500&h=500&fit=crop&q=85',
  shampoo: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&h=500&fit=crop&q=85',
  shallot: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&h=500&fit=crop&q=85',
  grapefruit: 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=500&h=500&fit=crop&q=85',
  pepper_color: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500&h=500&fit=crop&q=85',
  tabasco_chicken: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&h=500&fit=crop&q=85',
  tabasco_curry: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&h=500&fit=crop&q=85',
  nescafe_latte: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&h=500&fit=crop&q=85',
  nescafe_cappuccino: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&h=500&fit=crop&q=85',
  nescafe_spanish: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&h=500&fit=crop&q=85',
  canned_coconut: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&h=500&fit=crop&q=85',
  lollipop_fruit: 'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?w=500&h=500&fit=crop&q=85',
  my_chewy: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=500&h=500&fit=crop&q=85',
  pepsi_can: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&h=500&fit=crop&q=85',

  // Category General Fallbacks
  milk: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&h=500&fit=crop&q=85',
  produce: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&h=500&fit=crop&q=85',
  meat: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500&h=500&fit=crop&q=85',
  frozen: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=500&h=500&fit=crop&q=85',
  bakery: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&h=500&fit=crop&q=85',
  beverage: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500&h=500&fit=crop&q=85',
  coffee: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop&q=85',
  snack: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&h=500&fit=crop&q=85',
  noodles: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&h=500&fit=crop&q=85',
  pantry: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=500&h=500&fit=crop&q=85',
  personal_care: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&h=500&fit=crop&q=85',
  cleaning: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=500&h=500&fit=crop&q=85',
  stationery: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&h=500&fit=crop&q=85',
  grocery_generic: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&h=500&fit=crop&q=85',

  // Category Icons / Headers
  cat_dairy: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=400&h=400&fit=crop&q=80',
  cat_produce: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop&q=80',
  cat_meat: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=400&fit=crop&q=80',
  cat_frozen: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=400&fit=crop&q=80',
  cat_bakery: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop&q=80',
  cat_beverages: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=400&fit=crop&q=80',
  cat_coffee: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop&q=80',
  cat_snacks: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop&q=80',
  cat_cooking: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=400&fit=crop&q=80',
  cat_personal: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&q=80',
  cat_cleaning: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=400&fit=crop&q=80',
  cat_stationery: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&h=400&fit=crop&q=80',
  cat_breakfast: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=400&fit=crop&q=80',
  cat_condiments: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400&h=400&fit=crop&q=80',
  cat_baby: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop&q=80',
};

function downloadUrl(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadUrl(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: HTTP ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
      file.on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Downloading realistic high-definition product photographs...');
  const keys = Object.keys(photos);
  let done = 0;

  for (const key of keys) {
    const url = photos[key];
    const primaryDest = path.join(targetDirs[0], `${key}.png`);
    try {
      await downloadUrl(url, primaryDest);
      const data = fs.readFileSync(primaryDest);

      // Distribute to all other target directories
      for (let i = 1; i < targetDirs.length; i++) {
        fs.writeFileSync(path.join(targetDirs[i], `${key}.png`), data);
      }
      done++;
      console.log(`[${done}/${keys.length}] Saved realistic photo: ${key}.png (${(data.length / 1024).toFixed(1)} KB)`);
    } catch (e) {
      console.error(`Error downloading ${key}:`, e.message);
    }
  }

  console.log(`\nSuccessfully downloaded and distributed ${done} realistic product photographs to all frontend & backend asset locations!`);
}

main();

