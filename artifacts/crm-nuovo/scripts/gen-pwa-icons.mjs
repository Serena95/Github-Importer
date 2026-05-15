/**
 * Generates minimal PNG icons for the PWA manifest.
 * Uses only Node.js built-ins (fs, zlib) — no external deps needed.
 * Produces a 192x192 and a 512x512 blue rounded-square icon with a white "N".
 */
import { writeFileSync, mkdirSync } from 'fs';
import { deflateSync } from 'zlib';

/* ── CRC32 ── */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ CRC_TABLE[(c ^ buf[i]) & 0xff];
  return (c ^ 0xffffffff) >>> 0;
}

/* ── PNG chunk ── */
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const tb = Buffer.from(type);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([tb, data])));
  return Buffer.concat([len, tb, data, crcBuf]);
}

/* ── Build a PNG RGBA image ── */
function buildPNG(size, drawFn) {
  // Pixel buffer: RGBA
  const pixels = new Uint8Array(size * size * 4);

  // Fill background — Nexus blue #2563eb
  const bg = [0x25, 0x63, 0xeb, 0xff];

  for (let i = 0; i < size * size; i++) {
    pixels[i * 4]     = bg[0];
    pixels[i * 4 + 1] = bg[1];
    pixels[i * 4 + 2] = bg[2];
    pixels[i * 4 + 3] = bg[3];
  }

  // Rounded corners — carve out transparent pixels outside the rounded rect
  const radius = Math.round(size * 0.22);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inside = isInsideRoundedRect(x, y, size, size, radius);
      if (!inside) {
        const idx = (y * size + x) * 4;
        pixels[idx + 3] = 0; // transparent
      }
    }
  }

  // Draw white "N" glyph
  drawFn(pixels, size);

  // Encode as PNG
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; // 8-bit
  ihdrData[9] = 6; // RGBA
  const ihdr = chunk('IHDR', ihdrData);

  // Raw data: 1 filter byte + row of RGBA pixels per scanline
  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    raw[y * (1 + size * 4)] = 0; // no filter
    for (let x = 0; x < size; x++) {
      const si = (y * size + x) * 4;
      const di = y * (1 + size * 4) + 1 + x * 4;
      raw[di]     = pixels[si];
      raw[di + 1] = pixels[si + 1];
      raw[di + 2] = pixels[si + 2];
      raw[di + 3] = pixels[si + 3];
    }
  }

  const idat = chunk('IDAT', deflateSync(raw, { level: 6 }));
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

function isInsideRoundedRect(x, y, w, h, r) {
  if (x < r && y < r) return dist(x, y, r, r) <= r;
  if (x > w - 1 - r && y < r) return dist(x, y, w - 1 - r, r) <= r;
  if (x < r && y > h - 1 - r) return dist(x, y, r, h - 1 - r) <= r;
  if (x > w - 1 - r && y > h - 1 - r) return dist(x, y, w - 1 - r, h - 1 - r) <= r;
  return true;
}
function dist(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

/* ── Draw a white "N" in the center ── */
function drawN(pixels, size) {
  const margin = Math.round(size * 0.22);
  const thick  = Math.max(2, Math.round(size * 0.12));
  const x0 = margin;
  const x1 = size - margin;
  const y0 = margin;
  const y1 = size - margin;

  function setWhite(px, py) {
    if (px < 0 || py < 0 || px >= size || py >= size) return;
    const idx = (py * size + px) * 4;
    pixels[idx] = 255; pixels[idx+1] = 255; pixels[idx+2] = 255; pixels[idx+3] = 255;
  }

  // Left vertical bar
  for (let y = y0; y <= y1; y++)
    for (let t = 0; t < thick; t++) setWhite(x0 + t, y);

  // Right vertical bar
  for (let y = y0; y <= y1; y++)
    for (let t = 0; t < thick; t++) setWhite(x1 - t, y);

  // Diagonal from top-left to bottom-right
  const steps = Math.round(Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2)) * 2;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px = Math.round(x0 + thick / 2 + t * (x1 - x0 - thick));
    const py = Math.round(y0 + t * (y1 - y0));
    for (let dx = -Math.ceil(thick / 2); dx <= Math.ceil(thick / 2); dx++)
      for (let dy = -Math.ceil(thick / 2); dy <= Math.ceil(thick / 2); dy++)
        setWhite(px + dx, py + dy);
  }
}

/* ── Main ── */
const outDir = new URL('../public', import.meta.url).pathname;
mkdirSync(outDir, { recursive: true });

for (const size of [192, 512]) {
  const png = buildPNG(size, drawN);
  const outPath = `${outDir}/pwa-${size}.png`;
  writeFileSync(outPath, png);
  console.log(`✓ Created ${outPath} (${png.length} bytes)`);
}

// Also write a maskable icon (no rounded corners, full-bleed for Android)
function buildMaskable(size, drawFn) {
  const pixels = new Uint8Array(size * size * 4);
  const bg = [0x25, 0x63, 0xeb, 0xff];
  for (let i = 0; i < size * size; i++) {
    pixels[i * 4] = bg[0]; pixels[i * 4 + 1] = bg[1];
    pixels[i * 4 + 2] = bg[2]; pixels[i * 4 + 3] = bg[3];
  }
  drawFn(pixels, size);
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0); ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; ihdrData[9] = 6;
  const ihdr = chunk('IHDR', ihdrData);
  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    raw[y * (1 + size * 4)] = 0;
    for (let x = 0; x < size; x++) {
      const si = (y * size + x) * 4;
      const di = y * (1 + size * 4) + 1 + x * 4;
      raw.set(pixels.subarray(si, si + 4), di);
    }
  }
  return Buffer.concat([sig, ihdr, chunk('IDAT', deflateSync(raw, { level: 6 })), chunk('IEND', Buffer.alloc(0))]);
}

const maskable = buildMaskable(512, drawN);
writeFileSync(`${outDir}/pwa-maskable-512.png`, maskable);
console.log(`✓ Created ${outDir}/pwa-maskable-512.png`);
console.log('All PWA icons generated successfully!');
