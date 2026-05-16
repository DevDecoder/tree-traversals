import fs from 'fs';
import path from 'path';
import { validateAll } from './validate-all.mjs';

const languagesDir = './languages';
const outputFile = './manifest.json';

// Run validation first
if (!validateAll()) {
    console.error('Manifest generation aborted due to validation errors.');
    process.exit(1);
}

const languages = [];
const files = fs.readdirSync(languagesDir);

files.forEach(file => {
    if (file.endsWith('.lang')) {
        const content = fs.readFileSync(path.join(languagesDir, file), 'utf-8');
        const metaMatch = content.match(/\[meta\]([\s\S]*?)\[\/meta\]/);
        
        if (metaMatch) {
            const meta = {};
            metaMatch[1].split(/\r?\n/).forEach(line => {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const val = parts.slice(1).join(':').trim();
                    meta[key] = val;
                }
            });
            
            if (meta.id) {
                // Minimal manifest: only id, name, categories, and file
                languages.push({
                    id: meta.id,
                    name: meta.name,
                    categories: meta.categories || '',
                    file: file
                });
            }
        }
    }
});

fs.writeFileSync(outputFile, JSON.stringify({ languages }, null, 4));
console.log(`Manifest generated with ${languages.length} languages.`);
