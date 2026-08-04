const fs = require('fs');
const path = require('path');

const dir = '/var/www/exora/exora-mern/client/src/pages';
const mobileLayoutFile = '/var/www/exora/exora-mern/client/src/components/MobileLayout.jsx';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Match the entire object starting with { label: 'Join' and ending with },\s*
  const newContent = content.replace(/\{\s*label:\s*'Join'[^}]+\},\s*/g, '');
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Updated', filePath);
  }
}

// Process files in pages dir
fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.jsx')) {
    processFile(path.join(dir, file));
  }
});

// Process mobile layout
if (fs.existsSync(mobileLayoutFile)) {
  processFile(mobileLayoutFile);
}
