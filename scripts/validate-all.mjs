import fs from 'fs';
import path from 'path';
import { LangLoader } from '../src/lang-loader.js';

const languagesDir = './languages';
const files = fs.readdirSync(languagesDir);

let exitCode = 0;

files.forEach(file => {
    if (file.endsWith('.lang')) {
        try {
            const content = fs.readFileSync(path.join(languagesDir, file), 'utf-8');
            const loader = new LangLoader(content);
            
            if (!loader.meta.id || !loader.meta.name) {
                throw new Error('Missing basic meta tags (id, name)');
            }
            
            if (!loader.blocks.node) {
                throw new Error('Missing [node] block');
            }

            console.log(`✅ ${file} is valid.`);
        } catch (err) {
            console.error(`❌ ${file} failed validation: ${err.message}`);
            exitCode = 1;
        }
    }
});

process.exit(exitCode);
