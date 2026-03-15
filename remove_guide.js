const fs = require('fs');
const content = fs.readFileSync('pages/MinifigDetail.tsx', 'utf8');
const lines = content.split('\n');

// We want to remove lines 206 to 24126 (0-indexed 205 to 24125)
// Let's find the start and end indices dynamically to be safe.
const startIndex = lines.findIndex(line => line.includes("{/* Collector's Guide (SEO Description) */}"));
const endIndex = lines.findIndex((line, index) => index > startIndex && line.includes('Featured In Set'));

if (startIndex !== -1 && endIndex !== -1) {
    // Keep lines before startIndex, and lines from endIndex onwards
    const newLines = [...lines.slice(0, startIndex), ...lines.slice(endIndex)];
    fs.writeFileSync('pages/MinifigDetail.tsx', newLines.join('\n'), 'utf8');
    console.log('Successfully removed Collector\'s Guide sections.');
} else {
    console.log('Could not find start or end index.');
    console.log('startIndex:', startIndex);
    console.log('endIndex:', endIndex);
}
