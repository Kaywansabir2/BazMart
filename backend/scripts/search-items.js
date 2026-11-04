const fs = require('fs');

const mockContent = fs.readFileSync('c:/Users/zakar/BazMart/mobile-app/lib/core/data/mock_erp_catalog.dart', 'utf8');

const searches = ['Almarai', 'Schauma', 'Cappuccino', 'Spanish', 'Lollipop', 'Chewy', 'Piano', 'Pepper', 'Shallot', 'Grapefruit', 'Tabasco'];

console.log('=== SEARCHING IN mock_erp_catalog.dart ===');
for (const s of searches) {
    let pos = 0;
    while (true) {
        const idx = mockContent.indexOf(s, pos);
        if (idx === -1) break;
        const lineStart = mockContent.lastIndexOf('\n', idx) + 1;
        const lineEnd = mockContent.indexOf('\n', idx);
        console.log(`[${s}] line: ${mockContent.substring(lineStart, lineEnd).trim()}`);
        pos = idx + s.length;
    }
}
