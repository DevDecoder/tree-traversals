import fs from 'fs';
import path from 'path';

const languagesDir = './languages';
const outputFile = './manifest.json';

const languages = [];

const files = fs.readdirSync(languagesDir);

files.forEach(file => {
    if (file.endsWith('.lang')) {
        const content = fs.readFileSync(path.join(languagesDir, file), 'utf-8');
        const metaMatch = content.match(/\[meta\]([\s\S]*?)\[\/meta\]/);
        
        if (metaMatch) {
            const meta = {};
            metaMatch[1].split('\n').forEach(line => {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const val = parts.slice(1).join(':').trim();
                    meta[key] = val;
                }
            });
            
            if (meta.id) {
                languages.push({
                    ...meta,
                    file: file
                });
            }
        }
    }
});

fs.writeFileSync(outputFile, JSON.stringify({ languages }, null, 4));
console.log(`Manifest generated with ${languages.length} languages.`);
