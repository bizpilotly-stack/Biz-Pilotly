const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. High-Resolution SVG Brand Icon
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="112" fill="#0B1F3A"/>
  <circle cx="256" cy="256" r="180" fill="none" stroke="#D4AF37" stroke-width="24" stroke-opacity="0.9"/>
  <path d="M190 140 L340 256 L190 372 Z" fill="#D4AF37"/>
  <circle cx="340" cy="256" r="28" fill="#FFFFFF"/>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgIcon);
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgIcon);

// Helper to write minimal PNG fallback
function createDummyPngBuffer(width, height) {
  // Simple 1x1 base64 transparent PNG scaled or minimal binary
  const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  return Buffer.from(base64Png, 'base64');
}

fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), createDummyPngBuffer(192, 192));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), createDummyPngBuffer(512, 512));
fs.writeFileSync(path.join(iconsDir, 'maskable-icon.png'), createDummyPngBuffer(512, 512));
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), createDummyPngBuffer(180, 180));

console.log('✓ PWA Icons and SVG Favicon generated successfully in public/icons/');
