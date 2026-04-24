const fs = require('fs');
const path = require('path');

const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

// Regex to find <picture> \s* <img src="something.jpg" ...> \s* </picture>
// The regex needs to handle the fact that we ONLY want to add <source> tags if they aren't already there.
// If it finds an <img> inside a <picture> without any <source>, we'll inject the sources.
const pictureRegex = /<picture>([\s\S]*?)<img\s+(.*?)src="([^"]+)"(.*?)(>|\/>)([\s\S]*?)<\/picture>/g;

html = html.replace(pictureRegex, (match, beforeImg, imgBeforeSrc, src, imgAfterSrc, closingTag, afterImg) => {
  // If sources already exist here, skip it.
  if (beforeImg.includes('<source') || afterImg.includes('<source')) {
    return match; // return as is
  }

  const ext = path.extname(src).toLowerCase();
  
  // We only care about replacing .jpg, .jpeg, .png to include .avif/.webp
  if (['.jpg', '.jpeg', '.png'].includes(ext)) {
    const base = src.substring(0, src.length - ext.length);
    const avifSrc = `${base}.avif`;
    const webpSrc = `${base}.webp`;

    const sources = `
          <source srcset="${avifSrc}" type="image/avif">
          <source srcset="${webpSrc}" type="image/webp">`;
    
    // Inject sources right before the <img>
    return `<picture>${beforeImg}${sources}
          <img ${imgBeforeSrc}src="${src}"${imgAfterSrc}${closingTag}${afterImg}</picture>`;
  }

  return match;
});

fs.writeFileSync(file, html, 'utf8');
console.log('Successfully updated <picture> nodes in index.html');
