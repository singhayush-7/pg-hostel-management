const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('c:/Users/singh/OneDrive/Desktop/SmartStay/frontend/src', function(filePath) {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace classes
    content = content.replace(/bg-gradient-primary/g, 'bg-primary-500');
    content = content.replace(/shadow-glow-primary/g, 'shadow-md');
    content = content.replace(/gradient-text/g, 'text-primary-600');
    content = content.replace(/text-white">Stay/g, 'text-surface-900">Stay');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated: ' + filePath);
    }
  }
});
console.log('Done');
