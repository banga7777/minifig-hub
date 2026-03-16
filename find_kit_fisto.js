const fs = require('fs');
const content = fs.readFileSync('www/assets/index-BD_OyDmN.js', 'utf8');

// The file likely contains an array of objects like { item_no: "sw0585", name_en: "Kit Fisto", ... }
// Let's use a regex to find them.
const regex = /\{[^}]*?item_no:\s*["'](sw\d+[a-z]?)["'][^}]*?name_en:\s*["']([^"']*Kit Fisto[^"']*)["'][^}]*\}/gi;

let match;
while ((match = regex.exec(content)) !== null) {
  console.log(match[1], match[2]);
}
