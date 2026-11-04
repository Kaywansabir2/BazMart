const fs = require('fs');
const path = require('path');

// 1. Patch catalog/page.tsx
const catalogPath = path.resolve(__dirname, '../admin-web/src/app/catalog/page.tsx');
let catalogContent = fs.readFileSync(catalogPath, 'utf8');

if (!catalogContent.includes("import { getPhotoKey } from '@/lib/photo-utils';")) {
  catalogContent = catalogContent.replace(
    "import { formatIqd, formatNumber } from '@/lib/format';",
    "import { formatIqd, formatNumber } from '@/lib/format';\nimport { getPhotoKey } from '@/lib/photo-utils';"
  );
}

// Add 44x44 thumbnail to table row
const rowTarget = '<td className="py-3 px-4">\n                        <div className="font-bold text-slate-900">';
const rowReplace = `<td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                            <img
                              src={\`/images/products/\${getPhotoKey(p.id, p.category?.nameEn)}.png\`}
                              alt={p.titleEn}
                              className="w-full h-full object-contain"
                              onError={(e: any) => {
                                e.target.src = '/images/products/grocery_generic.png';
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">`;

if (catalogContent.includes(rowTarget)) {
  catalogContent = catalogContent.replace(rowTarget, rowReplace);
  catalogContent = catalogContent.replace(
    '<span>• {p.unitText}</span>\n                        </div>\n                      </td>',
    '<span>• {p.unitText}</span>\n                            </div>\n                          </div>\n                        </div>\n                      </td>'
  );
  console.log('Catalog table row thumbnail patched!');
}

// Edit modal preview photo
const previewTarget = '<div className="w-full h-24 bg-[#F5F6F8] rounded-lg flex items-center justify-center text-slate-400 text-xs font-bold mb-2">\n                    <Package className="w-8 h-8 text-slate-300" />\n                  </div>';
const previewReplace = `<div className="w-full h-28 bg-[#F8FAFC] rounded-lg border border-slate-200 flex items-center justify-center p-2 mb-2">
                    <img
                      src={\`/images/products/\${getPhotoKey(selectedProduct.id, selectedProduct.category?.nameEn)}.png\`}
                      alt={selectedProduct.titleEn}
                      className="max-h-full max-w-full object-contain"
                      onError={(e: any) => {
                        e.target.src = '/images/products/grocery_generic.png';
                      }}
                    />
                  </div>`;

if (catalogContent.includes(previewTarget)) {
  catalogContent = catalogContent.replace(previewTarget, previewReplace);
  console.log('Catalog preview photo patched!');
}

fs.writeFileSync(catalogPath, catalogContent, 'utf8');

// 2. Patch picker-portal/page.tsx
const pickerPath = path.resolve(__dirname, '../admin-web/src/app/picker-portal/page.tsx');
let pickerContent = fs.readFileSync(pickerPath, 'utf8');

if (!pickerContent.includes("import { getPhotoKey } from '@/lib/photo-utils';")) {
  pickerContent = pickerContent.replace(
    "import { api } from '@/lib/api';",
    "import { api } from '@/lib/api';\nimport { getPhotoKey } from '@/lib/photo-utils';"
  );
}

// Add aisleLocation to MockItem interface
if (!pickerContent.includes('aisleLocation?: string;')) {
  pickerContent = pickerContent.replace(
    'fefoBatch: string;',
    'fefoBatch: string;\n  aisleLocation?: string;'
  );
}

// Update mock items with aisleLocation
pickerContent = pickerContent.replace(
  "fefoBatch: 'BATCH-2026-089 (بەرواری بەسەرچوون: ٢٠ ڕۆژ)',",
  "fefoBatch: 'BATCH-2026-089 (بەرواری بەسەرچوون: ٢٠ ڕۆژ)',\n      aisleLocation: 'ڕێڕەوی B2 • بەشی میوە و سەوزەی تازە',"
);
pickerContent = pickerContent.replace(
  "fefoBatch: 'BATCH-2026-042 (بەرواری بەسەرچوون: ٦ مانگ)',",
  "fefoBatch: 'BATCH-2026-042 (بەرواری بەسەرچوون: ٦ مانگ)',\n      aisleLocation: 'ڕێڕەوی A1 • ساردکەرەوەی شیرەمەنی (5°C)',"
);
pickerContent = pickerContent.replace(
  "fefoBatch: 'BATCH-2026-015 (بەرواری بەسەرچوون: ٨ ڕۆژ)',",
  "fefoBatch: 'BATCH-2026-015 (بەرواری بەسەرچوون: ٨ ڕۆژ)',\n      aisleLocation: 'ڕێڕەوی A1 • هێلکەی فرێش و شیری تەواو',"
);

// Add 48x48 product photo and aisle badge to each item in picker list
const itemRowTarget = `<div className="space-y-1">
                    <div className="flex items-center gap-2">`;
const itemRowReplace = `<div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center p-1">
                      <img
                        src={\`/images/products/\${getPhotoKey(item.id, '')}.png\`}
                        alt={item.nameEn}
                        className="w-full h-full object-contain"
                        onError={(e: any) => {
                          e.target.src = '/images/products/grocery_generic.png';
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {item.aisleLocation && (
                          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {item.aisleLocation}
                          </span>
                        )}`;

if (pickerContent.includes(itemRowTarget)) {
  pickerContent = pickerContent.replace(itemRowTarget, itemRowReplace);
  console.log('Picker portal item photo and aisle location patched!');
}

fs.writeFileSync(pickerPath, pickerContent, 'utf8');
console.log('All admin thumbnails patched successfully!');

