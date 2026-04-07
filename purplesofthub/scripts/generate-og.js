#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create SVG-based OG image matching the dynamic version
const svgImage = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#06030f"/>
      <stop offset="50%" style="stop-color:#0d0520"/>
      <stop offset="100%" style="stop-color:#1a0535"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%">
      <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:0.3"/>
      <stop offset="100%" style="stop-color:#06030f;stop-opacity:0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- Logo circle with P -->
  <circle cx="600" cy="160" r="60" fill="none" stroke="#7c3aed" stroke-width="3"/>
  <text x="600" y="185" text-anchor="middle" font-family="Arial, sans-serif" font-size="60" font-weight="900" fill="#ffffff">P</text>

  <!-- Company name -->
  <text x="600" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="56" font-weight="900" fill="#ffffff">PurpleSoftHub</text>

  <!-- Tagline -->
  <text x="600" y="330" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="#a855f7">Digital Innovation Studio</text>

  <!-- Services row with emojis -->
  <text x="200" y="410" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#c084fc" font-weight="600">🌐 Web Dev</text>
  <text x="400" y="410" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#c084fc" font-weight="600">📱 Mobile</text>
  <text x="600" y="410" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#c084fc" font-weight="600">📣 Marketing</text>
  <text x="800" y="410" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#c084fc" font-weight="600">🎵 Music</text>
  <text x="1000" y="410" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#c084fc" font-weight="600">🎓 Academy</text>

  <!-- URL -->
  <rect x="350" y="470" width="500" height="50" fill="rgba(124,58,237,0.15)" stroke="rgba(124,58,237,0.3)" stroke-width="1" rx="25"/>
  <text x="600" y="505" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#a855f7" font-weight="600">🌐 purplesofthub.com</text>
</svg>
`;

const outputPath = path.join(__dirname, '..', 'public', 'og-image.png');

// Ensure public directory exists
const publicDir = path.dirname(outputPath);
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

sharp(Buffer.from(svgImage))
  .png()
  .toFile(outputPath)
  .then(info => {
    console.log('✅ OG image created successfully!');
    console.log(`   Location: ${outputPath}`);
    console.log(`   Size: ${info.size} bytes`);
  })
  .catch(err => {
    console.error('❌ Error creating OG image:', err);
    process.exit(1);
  });
