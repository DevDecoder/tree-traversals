import fs from 'fs';
import path from 'path';
import { LangLoader } from '../src/lang-loader.js';

const languagesDir = './languages';

export function validateAll() {
    const files = fs.readdirSync(languagesDir);
    let exitCode = 0;

    files.forEach(file => {
        if (file.endsWith('.lang')) {
            try {
                const content = fs.readFileSync(path.join(languagesDir, file), 'utf-8');
                
                // 1. Basic structural check
                const loader = new LangLoader(content);
                if (!loader.meta.id || !loader.meta.name) {
                    throw new Error('Missing basic meta tags (id, name)');
                }
                if (!loader.blocks.node) {
                    throw new Error('Missing [node] block');
                }

                // 2. Check for balanced tags
                const tags = ['preorder', 'inorder', 'postorder', 'focus', 'binary', 'ternary', 'nary'];
                tags.forEach(tag => {
                    const openCount = (content.match(new RegExp(`\\[${tag}\\]`, 'g')) || []).length;
                    const closeCount = (content.match(new RegExp(`\\[\\/${tag}\\]`, 'g')) || []).length;
                    if (openCount !== closeCount) {
                        throw new Error(`Unbalanced tags for [${tag}]: ${openCount} open, ${closeCount} close`);
                    }
                });

                console.log(`✅ ${file} is valid.`);
            } catch (err) {
                console.error(`❌ ${file} failed validation: ${err.message}`);
                exitCode = 1;
            }
        }
    });

    if (exitCode !== 0) {
        if (process.env.CI) process.exit(1);
        return false;
    }
    return true;
}

if (process.argv[1] === import.meta.url.replace('file://', '')) {
    validateAll();
}
