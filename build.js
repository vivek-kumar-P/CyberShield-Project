const fs = require('fs');
const path = require('path');

// Function to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy frontend directory to public
console.log('Building project...');
try {
  // Remove existing public directory if it exists
  if (fs.existsSync('public')) {
    fs.rmSync('public', { recursive: true, force: true });
  }
  
  // Copy frontend to public
  copyDir('frontend', 'public');
  console.log('✅ Build completed successfully!');
  console.log('📁 Frontend files copied to public directory');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
