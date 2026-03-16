const fs = require('fs');
const content = fs.readFileSync('pages/MinifigDetail.tsx', 'utf8');

const regex = /{minifig\.item_no === '([^']+)' && \([\s\S]*?<div className="relative z-10 text-slate-700 text-\[13px\] leading-relaxed font-medium space-y-3">\s*<p>\s*([\s\S]*?)\s*<\/p>\s*<p>\s*([\s\S]*?)\s*<\/p>\s*<\/div>/g;

let match;
const results = [];
while ((match = regex.exec(content)) !== null) {
  const itemNo = match[1];
  const p1 = match[2].replace(/<[^>]+>/g, '').trim();
  const p2 = match[3].replace(/<[^>]+>/g, '').trim();
  results.push({ itemNo, p1, p2 });
}

fs.writeFileSync('descriptions.json', JSON.stringify(results, null, 2));
console.log(`Extracted ${results.length} descriptions.`);
