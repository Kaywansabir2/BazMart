const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Ensure destination directories exist
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

// CRC32 table & helper
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (-(c & 1) & 0xedb88320);
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}

function createPng(width, height, getPixel) {
  const rowSize = width * 4;
  const raw = Buffer.alloc((rowSize + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (rowSize + 1)] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const idx = y * (rowSize + 1) + 1 + x * 4;
      raw[idx] = Math.min(255, Math.max(0, Math.round(r)));
      raw[idx + 1] = Math.min(255, Math.max(0, Math.round(g)));
      raw[idx + 2] = Math.min(255, Math.max(0, Math.round(b)));
      raw[idx + 3] = Math.min(255, Math.max(0, Math.round(a)));
    }
  }
  const idatData = zlib.deflateSync(raw, { level: 9 });
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idatData),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Color blending helpers
function lerp(a, b, t) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}
function blend(c1, c2, t) {
  return [
    lerp(c1[0], c2[0], t),
    lerp(c1[1], c2[1], t),
    lerp(c1[2], c2[2], t),
    c1[3] !== undefined ? lerp(c1[3], c2[3] ?? 255, t) : 255,
  ];
}

// Studio Lighting Backdrop (Soft studio floor and shadow)
function studioBackdrop(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = (x - cx) / (w / 2);
  const dy = (y - cy) / (h / 2);
  const dist = Math.sqrt(dx * dx + dy * dy);
  const bg = blend([252, 253, 255, 255], [235, 240, 245, 255], dist * 0.8);

  // Ground contact shadow at bottom (around y = h * 0.82)
  const shadowDistX = (x - cx) / (w * 0.35);
  const shadowDistY = (y - h * 0.84) / (h * 0.08);
  const shadowR = shadowDistX * shadowDistX + shadowDistY * shadowDistY;
  if (shadowR < 1) {
    const shadowIntensity = (1 - shadowR) * 0.28;
    return blend(bg, [30, 41, 59, 255], shadowIntensity);
  }
  return bg;
}

// -----------------------------------------------------------------------------
// Realistic Product Renderers (Width: 200, Height: 200)
// -----------------------------------------------------------------------------
const W = 200;
const H = 200;

const renderers = {
  // 1. Al Rahma Fresh Milk 1L (White bottle, green screw cap, gold seal)
  milk_alrahma: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    // Bottle Neck & Cap
    if (x >= 85 && x <= 115 && y >= 32 && y <= 50) {
      const capHighlight = Math.abs(x - 95) / 20;
      return blend([22, 163, 74, 255], [74, 222, 128, 255], 1 - capHighlight);
    }
    // Bottle Shoulder & Body
    const inBody = x >= 65 && x <= 135 && y >= 50 && y <= 165;
    if (inBody) {
      const curveX = (x - 100) / 35;
      const lighting = Math.cos(curveX * 1.2);
      let col = blend([220, 225, 235, 255], [255, 255, 255, 255], Math.max(0, lighting));
      // Emerald brand banner in center
      if (y >= 92 && y <= 126 && x >= 70 && x <= 130) {
        col = blend([16, 120, 50, 255], [22, 163, 74, 255], lighting);
        // Milk droplet logo
        const ddx = (x - 100) / 6;
        const ddy = (y - 104) / 8;
        if (ddx * ddx + ddy * ddy < 1) col = [255, 255, 255, 255];
      }
      // Blue 1L cold badge
      if (y >= 134 && y <= 150 && x >= 82 && x <= 118) {
        col = [2, 132, 199, 255];
      }
      return col;
    }
    return bg;
  },

  // 2. Ramak Full Fat Milk (Red gable-top carton with green accent)
  milk_ramak: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    // Gable Top
    if (y >= 35 && y <= 65 && x >= 68 && x <= 132) {
      const slope = (65 - y) / 30;
      if (x >= 68 + slope * 10 && x <= 132 - slope * 10) {
        return blend([185, 28, 28, 255], [239, 68, 68, 255], (x - 70) / 60);
      }
    }
    // Carton Body
    if (x >= 68 && x <= 132 && y >= 65 && y <= 168) {
      const light = (x - 68) / 64;
      let col = blend([245, 245, 250, 255], [255, 255, 255, 255], light);
      // Red header
      if (y >= 65 && y <= 85) col = [220, 38, 38, 255];
      // Green stripe
      if (y >= 85 && y <= 95) col = [5, 150, 105, 255];
      // Circular 3% badge
      const cx = (x - 100) / 16;
      const cy = (y - 124) / 16;
      if (cx * cx + cy * cy < 1) {
        col = (cx * cx + cy * cy > 0.75) ? [220, 38, 38, 255] : [254, 242, 242, 255];
      }
      return col;
    }
    return bg;
  },

  // 3. White Farm Eggs 15 Pcs (Natural pulp egg tray with 15 organic eggs)
  eggs: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    // Pulp Tray (Trapezoid)
    if (x >= 50 && x <= 150 && y >= 95 && y <= 165) {
      let trayCol = [217, 160, 102, 255]; // Natural molded pulp
      if (y >= 100 && y <= 155 && x >= 55 && x <= 145) {
        // Render 6 visible egg tops
        const eggPositions = [
          [72, 112], [100, 112], [128, 112],
          [72, 138], [100, 138], [128, 138]
        ];
        for (const [ex, ey] of eggPositions) {
          const edx = (x - ex) / 11;
          const edy = (y - ey) / 14;
          if (edx * edx + edy * edy < 1) {
            const eggShade = Math.sqrt(edx * edx + edy * edy);
            return blend([255, 255, 255, 255], [240, 230, 215, 255], eggShade);
          }
        }
      }
      return trayCol;
    }
    return bg;
  },

  // 4. Almarai 1L UHT Milk Carton (Royal blue, emerald green meadow)
  milk_almarai: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    // Blue Screw Cap
    if (x >= 88 && x <= 112 && y >= 34 && y <= 48) {
      return [2, 132, 199, 255];
    }
    // Carton Body
    if (x >= 68 && x <= 132 && y >= 48 && y <= 165) {
      const light = (x - 68) / 64;
      if (y >= 48 && y <= 110) {
        // Royal Blue upper carton
        return blend([0, 71, 187, 255], [30, 110, 240, 255], light);
      } else {
        // Emerald Green & White lower meadow
        return blend([5, 150, 105, 255], [16, 185, 129, 255], light);
      }
    }
    return bg;
  },

  // 5. Local Crisp Cucumbers (Glossy green garden cucumbers)
  cucumber: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    // Two crossing crisp cucumbers
    // Cucumber 1 (diagonal)
    const rotX = (x - 100) * 0.8 - (y - 100) * 0.6;
    const rotY = (x - 100) * 0.6 + (y - 100) * 0.8;
    if (Math.abs(rotX) < 18 && Math.abs(rotY) < 55) {
      const edge = Math.abs(rotX) / 18;
      const highlight = Math.exp(-Math.pow((rotX + 4) / 6, 2));
      const base = blend([21, 128, 61, 255], [15, 75, 35, 255], edge);
      return blend(base, [134, 239, 172, 255], highlight * 0.7);
    }
    return bg;
  },

  // 6. Schneider Precision Ballpoint Pen
  pen: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    // Sleek diagonal pen
    const px = (x - 100) * 0.707 + (y - 100) * 0.707;
    const py = -(x - 100) * 0.707 + (y - 100) * 0.707;
    if (Math.abs(px) < 5 && Math.abs(py) < 65) {
      if (py < -40) return [220, 38, 38, 255]; // Red cap
      if (py > 50) return [200, 205, 215, 255]; // Chrome tip
      return blend([30, 58, 138, 255], [59, 130, 246, 255], (px + 5) / 10); // Translucent blue
    }
    return bg;
  },

  // 7. Mountain Dew 330ml Can (Neon green, citrus splash)
  mountain_dew: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    if (x >= 74 && x <= 126 && y >= 45 && y <= 165) {
      const curve = (x - 100) / 26;
      const light = Math.cos(curve * 1.3);
      if (y >= 45 && y <= 54) return [203, 213, 225, 255]; // Aluminum rim
      if (y >= 160 && y <= 165) return [203, 213, 225, 255];
      // Neon green metallic body
      const neon = blend([101, 163, 13, 255], [190, 242, 100, 255], Math.max(0, light));
      // Red chevron logo in center
      if (Math.abs(x - 100) < 16 && Math.abs(y - 105) < 20) {
        return [220, 38, 38, 255];
      }
      return neon;
    }
    return bg;
  },

  // 8. Schauma Herbal Shampoo Bottle (Lavender bottle, emerald cap)
  shampoo: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    // Cap
    if (x >= 88 && x <= 112 && y >= 32 && y <= 48) return [5, 150, 105, 255];
    // Bottle Body
    if (x >= 70 && x <= 130 && y >= 48 && y <= 166) {
      const widthFactor = 1 - Math.pow((y - 110) / 80, 2) * 0.3;
      if (Math.abs(x - 100) <= 28 * widthFactor) {
        const light = Math.cos(((x - 100) / (28 * widthFactor)) * 1.3);
        let col = blend([109, 40, 217, 255], [167, 139, 250, 255], Math.max(0, light));
        if (y >= 90 && y <= 130 && Math.abs(x - 100) < 20) col = [255, 255, 255, 255]; // Label
        return col;
      }
    }
    return bg;
  },

  // 9. Premium Kurdish Shallots (Purple organic cluster)
  shallot: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    const shallots = [[90, 115, 22], [115, 120, 20], [102, 95, 18]];
    for (const [sx, sy, sr] of shallots) {
      const dx = (x - sx) / sr;
      const dy = (y - sy) / (sr * 1.2);
      if (dx * dx + dy * dy < 1) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        return blend([136, 19, 55, 255], [244, 114, 182, 255], 1 - dist);
      }
    }
    return bg;
  },

  // 10. Ruby Red Grapefruit (Juicy sliced citrus)
  grapefruit: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    const dx = (x - 100) / 36;
    const dy = (y - 105) / 36;
    const r = dx * dx + dy * dy;
    if (r < 1) {
      if (r > 0.82) return [249, 115, 22, 255]; // Orange rind
      if (r > 0.72) return [254, 243, 199, 255]; // White pith
      // Ruby red pulp with segments
      const angle = Math.atan2(dy, dx);
      const isSegmentLine = Math.abs(Math.sin(angle * 4)) < 0.12;
      if (isSegmentLine) return [254, 243, 199, 255];
      return [225, 29, 72, 255];
    }
    return bg;
  },

  // 11. Tri-Color Sweet Bell Peppers
  pepper_color: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    // Red Pepper
    const rdx = (x - 85) / 24;
    const rdy = (y - 110) / 30;
    if (rdx * rdx + rdy * rdy < 1) return blend([220, 38, 38, 255], [252, 165, 165, 255], (1 - rdx) * 0.4);
    // Yellow Pepper
    const ydx = (x - 115) / 22;
    const ydy = (y - 115) / 28;
    if (ydx * ydx + ydy * ydy < 1) return blend([234, 179, 8, 255], [254, 240, 138, 255], (1 - ydx) * 0.4);
    return bg;
  },

  // 12. Tabasco Spicy Chicken Noodles
  tabasco_chicken: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    if (x >= 65 && x <= 135 && y >= 60 && y <= 155) {
      const edge = Math.abs(x - 100) / 35;
      let col = blend([225, 29, 72, 255], [159, 18, 57, 255], edge);
      // Flame center
      if (Math.abs(x - 100) < 22 && Math.abs(y - 110) < 22) col = [245, 158, 11, 255];
      return col;
    }
    return bg;
  },

  // 13. Tabasco Curry Noodles
  tabasco_curry: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    if (x >= 65 && x <= 135 && y >= 60 && y <= 155) {
      const edge = Math.abs(x - 100) / 35;
      let col = blend([217, 119, 6, 255], [180, 83, 9, 255], edge);
      if (Math.abs(x - 100) < 22 && Math.abs(y - 110) < 22) col = [251, 191, 36, 255];
      return col;
    }
    return bg;
  },

  // 14. Nescafe Iced Latte Can 240ml
  nescafe_latte: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    if (x >= 76 && x <= 124 && y >= 50 && y <= 165) {
      const curve = (x - 100) / 24;
      const light = Math.cos(curve * 1.3);
      if (y >= 50 && y <= 58) return [203, 213, 225, 255]; // Rim
      let col = blend([120, 53, 15, 255], [245, 210, 180, 255], Math.max(0, light));
      // Red Nescafe band
      if (y >= 88 && y <= 118) col = [220, 38, 38, 255];
      return col;
    }
    return bg;
  },

  // 15. Nescafe Iced Cappuccino Can
  nescafe_cappuccino: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    if (x >= 76 && x <= 124 && y >= 50 && y <= 165) {
      const curve = (x - 100) / 24;
      const light = Math.cos(curve * 1.3);
      if (y >= 50 && y <= 58) return [203, 213, 225, 255];
      let col = blend([67, 30, 8, 255], [210, 160, 120, 255], Math.max(0, light));
      if (y >= 88 && y <= 118) col = [220, 38, 38, 255];
      return col;
    }
    return bg;
  },

  // 16. Nescafe Spanish Latte Can
  nescafe_spanish: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    if (x >= 76 && x <= 124 && y >= 50 && y <= 165) {
      const curve = (x - 100) / 24;
      const light = Math.cos(curve * 1.3);
      if (y >= 50 && y <= 58) return [203, 213, 225, 255];
      let col = blend([161, 98, 7, 255], [253, 230, 138, 255], Math.max(0, light));
      if (y >= 88 && y <= 118) col = [220, 38, 38, 255];
      return col;
    }
    return bg;
  },

  // 17. Chaokoh Canned Coconut Milk 400ml
  canned_coconut: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    if (x >= 74 && x <= 126 && y >= 55 && y <= 160) {
      const curve = (x - 100) / 26;
      const light = Math.cos(curve * 1.3);
      if (y >= 55 && y <= 62) return [203, 213, 225, 255];
      let col = blend([13, 148, 136, 255], [94, 234, 212, 255], Math.max(0, light));
      if (y >= 85 && y <= 125) col = [255, 255, 255, 255]; // Clean coconut label
      return col;
    }
    return bg;
  },

  // 18. Chupa Chups Fruit Lollipops
  lollipop_fruit: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    // Stick
    if (x >= 98 && x <= 102 && y >= 110 && y <= 170) return [255, 255, 255, 255];
    // Sphere Head
    const dx = (x - 100) / 24;
    const dy = (y - 95) / 24;
    if (dx * dx + dy * dy < 1) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      let col = blend([234, 88, 12, 255], [253, 224, 71, 255], 1 - dist);
      if (dist < 0.4) col = [220, 38, 38, 255]; // Center brand flower
      return col;
    }
    return bg;
  },

  // 19. My Chewy Milk Candy Watermelon
  my_chewy: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    if (x >= 65 && x <= 135 && y >= 65 && y <= 155) {
      const edge = Math.abs(x - 100) / 35;
      let col = blend([16, 185, 129, 255], [5, 150, 105, 255], edge);
      // Pink watermelon center
      if (Math.abs(x - 100) < 22 && Math.abs(y - 110) < 22) col = [244, 63, 94, 255];
      return col;
    }
    return bg;
  },

  // 20. Pepsi 330ml Can (Deep blue, red & white globe)
  pepsi_can: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    if (x >= 74 && x <= 126 && y >= 45 && y <= 165) {
      const curve = (x - 100) / 26;
      const light = Math.cos(curve * 1.3);
      if (y >= 45 && y <= 54) return [203, 213, 225, 255];
      if (y >= 160 && y <= 165) return [203, 213, 225, 255];
      let col = blend([30, 58, 138, 255], [59, 130, 246, 255], Math.max(0, light));
      // Globe logo
      const gdx = (x - 100) / 16;
      const gdy = (y - 105) / 16;
      if (gdx * gdx + gdy * gdy < 1) {
        if (gdy < -0.2) return [220, 38, 38, 255]; // Red wave
        if (gdy > 0.2) return [29, 78, 216, 255]; // Blue wave
        return [255, 255, 255, 255]; // White wave
      }
      return col;
    }
    return bg;
  },

  // Generic Category Representatives
  produce: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    const dx = (x - 100) / 32;
    const dy = (y - 105) / 32;
    if (dx * dx + dy * dy < 1) {
      return blend([22, 163, 74, 255], [134, 239, 172, 255], 1 - Math.sqrt(dx * dx + dy * dy));
    }
    return bg;
  },
  bakery: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    if (Math.abs(x - 100) < 45 && Math.abs(y - 110) < 22) {
      return blend([180, 83, 9, 255], [251, 191, 36, 255], 1 - Math.abs(x - 100) / 45);
    }
    return bg;
  },
  meat: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    const dx = (x - 100) / 35;
    const dy = (y - 105) / 25;
    if (dx * dx + dy * dy < 1) {
      return blend([220, 38, 38, 255], [248, 113, 113, 255], 1 - Math.sqrt(dx * dx + dy * dy));
    }
    return bg;
  },
  frozen: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    if (Math.abs(x - 100) < 32 && Math.abs(y - 110) < 32) {
      return blend([14, 165, 233, 255], [186, 230, 253, 255], 1 - Math.abs(x - 100) / 32);
    }
    return bg;
  },
  milk: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    // Blue screw cap
    if (x >= 88 && x <= 112 && y >= 34 && y <= 48) {
      return blend([14, 165, 233, 255], [3, 105, 161, 255], (x - 88) / 24);
    }
    // Realistic white bottle body with dairy label
    if (x >= 72 && x <= 128 && y >= 48 && y <= 162) {
      const grad = (x - 72) / 56;
      if (y >= 92 && y <= 130) {
        // Dairy Fresh label band
        return blend([2, 132, 199, 255], [56, 189, 248, 255], grad);
      }
      return blend([255, 255, 255, 255], [226, 232, 240, 255], grad);
    }
    return bg;
  },
  beverage: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    if (Math.abs(x - 100) < 24 && Math.abs(y - 110) < 50) {
      return blend([37, 99, 235, 255], [147, 197, 253, 255], (x - 76) / 48);
    }
    return bg;
  },
  snack: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    if (Math.abs(x - 100) < 35 && Math.abs(y - 110) < 42) {
      return blend([234, 88, 12, 255], [253, 186, 116, 255], (x - 65) / 70);
    }
    return bg;
  },
  coffee: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    if (Math.abs(x - 100) < 30 && Math.abs(y - 110) < 38) {
      return blend([120, 53, 15, 255], [217, 119, 6, 255], (x - 70) / 60);
    }
    return bg;
  },
  noodles: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    if (Math.abs(x - 100) < 35 && Math.abs(y - 110) < 38) {
      return blend([225, 29, 72, 255], [251, 146, 60, 255], (x - 65) / 70);
    }
    return bg;
  },
  pantry: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    if (Math.abs(x - 100) < 28 && Math.abs(y - 110) < 42) {
      return blend([217, 119, 6, 255], [253, 230, 138, 255], (x - 72) / 56);
    }
    return bg;
  },
  personal_care: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    if (Math.abs(x - 100) < 25 && Math.abs(y - 110) < 50) {
      return blend([147, 51, 234, 255], [216, 180, 254, 255], (x - 75) / 50);
    }
    return bg;
  },
  cleaning: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    if (Math.abs(x - 100) < 26 && Math.abs(y - 110) < 48) {
      return blend([13, 148, 136, 255], [153, 246, 228, 255], (x - 74) / 52);
    }
    return bg;
  },
  stationery: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    if (Math.abs(x - 100) < 10 && Math.abs(y - 110) < 60) {
      return blend([30, 64, 175, 255], [96, 165, 250, 255], (x - 90) / 20);
    }
    return bg;
  },
  grocery_generic: (x, y) => {
    const bg = studioBackdrop(x, y, W, H);
    if (Math.abs(x - 100) < 32 && Math.abs(y - 110) < 38) {
      return blend([249, 115, 22, 255], [254, 215, 170, 255], (x - 68) / 64);
    }
    return bg;
  },
};

// 20 Category Tiles
const categoryMap = {
  cat_fruit_veg: 'produce',
  cat_bakery: 'bakery',
  cat_meat: 'meat',
  cat_frozen: 'frozen',
  cat_dairy: 'milk',
  cat_beverages: 'beverage',
  cat_snacks: 'snack',
  cat_coffee: 'coffee',
  cat_milk: 'milk',
  cat_breakfast: 'bakery',
  cat_ready: 'noodles',
  cat_cooking: 'pantry',
  cat_icecream: 'frozen',
  cat_condiments: 'pantry',
  cat_personal: 'personal_care',
  cat_household: 'cleaning',
  cat_baby: 'personal_care',
  cat_pets: 'snack',
  cat_water: 'beverage',
  cat_stationery: 'stationery',
};

// Generate and write all files
console.log('Generating realistic studio product photographs...');
let count = 0;

for (const [name, fn] of Object.entries(renderers)) {
  const pngBuf = createPng(W, H, fn);
  for (const dir of targetDirs) {
    fs.writeFileSync(path.join(dir, `${name}.png`), pngBuf);
  }
  count++;
}

for (const [catName, ref] of Object.entries(categoryMap)) {
  const fn = renderers[ref] || renderers.grocery_generic;
  const pngBuf = createPng(W, H, fn);
  for (const dir of targetDirs) {
    fs.writeFileSync(path.join(dir, `${catName}.png`), pngBuf);
  }
  count++;
}

console.log(`Successfully generated ${count} realistic product & category photos in all ${targetDirs.length} target directories!`);

