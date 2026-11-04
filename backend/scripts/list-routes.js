const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../src');

function scan(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) {
            scan(full);
        } else if (f.endsWith('.controller.ts')) {
            const content = fs.readFileSync(full, 'utf8');
            const cMatch = content.match(/@Controller\(['"](.*?)['"]\)/);
            const prefix = cMatch ? cMatch[1] : '';
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                const m = line.match(/@(Get|Post|Put|Patch|Delete)\((['"](.*?)['"])?\)/);
                if (m) {
                    const method = m[1].toUpperCase();
                    const subRoute = m[3] || '';
                    const fullRoute = '/' + [prefix, subRoute].filter(Boolean).join('/').replace(/\/+/g, '/');
                    const nextLine = (lines[i + 1] || '').trim();
                    console.log(`${method.padEnd(7)} ${fullRoute.padEnd(50)} ${nextLine}`);
                }
            }
        }
    }
}

scan(srcDir);

