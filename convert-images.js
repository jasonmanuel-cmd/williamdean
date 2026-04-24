const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = process.cwd();
const exts = ['.jpg', '.jpeg', '.png'];

async function convert(file){
  const ext = path.extname(file).toLowerCase();
  const name = path.basename(file, ext);
  const input = path.join(dir, file);
  const webp = path.join(dir, name + '.webp');
  const avif = path.join(dir, name + '.avif');
  try{
    if(!fs.existsSync(webp)){
      await sharp(input).toFormat('webp',{quality:80}).toFile(webp);
      console.log('wrote', webp);
    } else console.log('webp exists', webp);
    if(!fs.existsSync(avif)){
      await sharp(input).toFormat('avif',{quality:50}).toFile(avif);
      console.log('wrote', avif);
    } else console.log('avif exists', avif);
  }catch(err){
    console.error('failed', file, err.message);
  }
}

(async ()=>{
  const files = fs.readdirSync(dir).filter(f=>exts.includes(path.extname(f).toLowerCase()));
  for(const f of files){
    await convert(f);
  }
  console.log('done');
})();
