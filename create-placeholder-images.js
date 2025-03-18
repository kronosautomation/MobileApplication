const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Ensure the images directory exists
const imageDir = path.join(__dirname, 'assets', 'images');
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

// Create a placeholder PNG
function createPlaceholderImage(filename, width, height, text, bgColor) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Add text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `${Math.floor(width/10)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width/2, height/2);

  // Create a gradient circle for icon-like look
  const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
  gradient.addColorStop(0, 'rgba(255,255,255,0.2)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.1)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(width/2, height/2, width/3, 0, Math.PI * 2);
  ctx.fill();

  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(imageDir, filename), buffer);

  console.log(`Created ${filename}`);
}

// If you don't have canvas installed, this alternative 
// creates a 1x1 transparent pixel PNG as minimal placeholder
function createMinimalPlaceholder(filename) {
  // This is a valid 1x1 transparent PNG
  const minimalPNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );
  
  fs.writeFileSync(path.join(imageDir, filename), minimalPNG);
  console.log(`Created minimal placeholder for ${filename}`);
}

try {
  // Try to use canvas
  createPlaceholderImage('icon.png', 1024, 1024, 'MM', '#4A62FF');
  createPlaceholderImage('splash.png', 1242, 2436, 'MindfulMastery', '#4A62FF');
  createPlaceholderImage('adaptive-icon.png', 1080, 1080, 'MM', '#4A62FF');
} catch (error) {
  console.log('Canvas dependency not available, creating minimal placeholders');
  // Fallback to minimal placeholders
  createMinimalPlaceholder('icon.png');
  createMinimalPlaceholder('splash.png');
  createMinimalPlaceholder('adaptive-icon.png');
}

console.log('Placeholder images created successfully!');
