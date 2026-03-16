const fs = require('fs');
const content = fs.readFileSync('pages/MinifigDetail.tsx', 'utf8');
const regex = /minifig\.item_no === '([^']+)'/g;
const matches = [...content.matchAll(regex)].map(m => m[1]);
console.log(matches.join(', '));
