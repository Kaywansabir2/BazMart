const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) results = results.concat(getFiles(full));
    else if (full.endsWith('.dart')) results.push(full);
  }
  return results;
}

const files = getFiles(path.join(__dirname, '../mobile-app/lib'));
const usedKeys = new Set();
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const r1 = /AppTranslations\.get\(\s*'([^']+)'/g;
  let m;
  while ((m = r1.exec(content)) !== null) usedKeys.add(m[1]);
  const r2 = /translate\(\s*'([^']+)'/g;
  while ((m = r2.exec(content)) !== null) usedKeys.add(m[1]);
}

const transContent = fs.readFileSync(path.join(__dirname, '../mobile-app/lib/core/localization/app_translations.dart'), 'utf8');
const missingKeys = [];
for (const k of usedKeys) {
  const target = `'${k}':`;
  if (!transContent.includes(target)) {
    missingKeys.push(k);
  }
}
console.log('Total used keys:', usedKeys.size);
console.log('Missing keys in app_translations:', JSON.stringify(missingKeys, null, 2));

