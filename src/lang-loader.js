export class LangLoader {
    constructor(langContent) {
        this.rawContent = langContent;
        this.meta = {};
        this.blocks = {
            node: '',
            leaf: '',
            empty: '',
            preorder: '',
            inorder: '',
            postorder: ''
        };
        this.globalTemplate = '';
        this.parse();
    }

    parse() {
        let content = this.rawContent;

        // Parse meta
        const metaMatch = content.match(/\[meta\]([\s\S]*?)\[\/meta\]/);
        if (metaMatch) {
            metaMatch[1].split(/\r?\n/).forEach(line => {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const val = parts.slice(1).join(':').trim();
                    this.meta[key] = val;
                }
            });
            content = content.replace(/\[meta\][\s\S]*?\[\/meta\]\s*\n?/, '');
        }

        // Extract structural blocks only
        ['node', 'leaf', 'empty'].forEach(block => {
            const regex = new RegExp(`\\[${block}\\]([\\s\\S]*?)\\[\\/${block}\\]\\s*\\n?`);
            const match = content.match(regex);
            if (match) {
                this.blocks[block] = match[1].replace(/^\r?\n/, '').replace(/\r?\n$/, ''); 
                content = content.replace(regex, '');
            }
        });

        this.globalTemplate = content;
    }

    generateCode(treeRoot, arity, mode, isFocused = true) {
        let template = this.globalTemplate;
        
        const isPreActive = (mode === 'PRE');
        const isInActive = (mode === 'IN' && arity === 'binary');
        const isPostActive = (mode === 'POST');

        if (isFocused) {
            let result = '';
            const regex = /\[(preorder|inorder|postorder|!preorder|!inorder|!postorder|focus)\]([\s\S]*?)\[\/\1\]/g;
            let match;
            while ((match = regex.exec(template)) !== null) {
                const tag = match[1];
                const content = match[2];
                
                let isActive = false;
                if (tag === 'preorder') isActive = isPreActive;
                else if (tag === 'inorder') isActive = isInActive;
                else if (tag === 'postorder') isActive = isPostActive;
                else if (tag === '!preorder') isActive = !isPreActive;
                else if (tag === '!inorder') isActive = !isInActive && (arity === 'binary');
                else if (tag === '!postorder') isActive = !isPostActive;
                else if (tag === 'focus') isActive = true;

                if (isActive) {
                    result += content;
                }
            }
            template = result;
        } else {
            // Focus Mode OFF: Keep text outside, process valid blocks, drop [focus]
            ['preorder', 'inorder', 'postorder'].forEach(algo => {
                const isValidArity = !(algo === 'inorder' && arity !== 'binary');
                
                // Keep positive blocks if valid arity, else remove
                const posRegex = new RegExp(`\\[${algo}\\]([\\s\\S]*?)\\[\\/${algo}\\]`, 'g');
                template = template.replace(posRegex, isValidArity ? '$1' : '');
                
                // Remove all negative blocks (only used for Focus Mode)
                const negRegex = new RegExp(`\\[!${algo}\\]([\\s\\S]*?)\\[\\/!${algo}\\]`, 'g');
                template = template.replace(negRegex, '');
            });
            
            // KEEP [focus] block content (strip tags)
            template = template.replace(/\[focus\]([\s\S]*?)\[\/focus\]/g, '$1');
        }

        // 2. Process Arity logic across the entire text space
        template = this.processArity(template, arity);
        
        // Process arity for the node templates too
        const nodeTpl = this.processArity(this.blocks.node, arity);
        const leafTpl = this.processArity(this.blocks.leaf || this.blocks.node, arity);
        const emptyTpl = this.processArity(this.blocks.empty, arity);

        // 2. Evaluate the Tree
        const evaluateNode = (node, parent) => {
            if (!node) return emptyTpl;

            // Map children to logical positions for fixed-arity templates
            const children = node.children || [];
            const left = children.length > 0 ? children[0] : null;
            const right = children.length > 0 ? children[children.length - 1] : null;
            const middle = children.length > 0 ? children[Math.ceil((children.length - 1) / 2)] : null;

            const isLeaf = children.length === 0;
            let str = isLeaf ? leafTpl : nodeTpl;

            // Value replacements
            str = str.replace(/\{\{value\}\}/g, node.value !== undefined ? node.value : "NULL");
            str = str.replace(/\{\{parentValue\}\}/g, parent ? parent.value : "NULL");
            str = str.replace(/\{\{leftValue\}\}/g, left ? left.value : "NULL");
            str = str.replace(/\{\{middleValue\}\}/g, middle ? middle.value : "NULL");
            str = str.replace(/\{\{rightValue\}\}/g, right ? right.value : "NULL");

            // Recursive Replacements
            if (str.includes('{{left}}')) str = str.replace(/\{\{left\}\}/g, evaluateNode(left, node));
            if (str.includes('{{middle}}')) str = str.replace(/\{\{middle\}\}/g, evaluateNode(middle, node));
            if (str.includes('{{right}}')) str = str.replace(/\{\{right\}\}/g, evaluateNode(right, node));

            // Process N-ary Children
            if (str.includes('[children]')) {
                const childFirstMatch = str.match(/\[children:first\]([\s\S]*?)\[\/children:first\]/);
                const childLastMatch = str.match(/\[children:last\]([\s\S]*?)\[\/children:last\]/);
                const childMatch = str.match(/\[children\]([\s\S]*?)\[\/children\]/);

                const firstTpl = childFirstMatch ? childFirstMatch[1] : (childMatch ? childMatch[1] : '');
                const lastTpl = childLastMatch ? childLastMatch[1] : (childMatch ? childMatch[1] : '');
                const normTpl = childMatch ? childMatch[1] : '';

                let childrenResult = '';
                if (node.children && node.children.length > 0) {
                    for (let i = 0; i < node.children.length; i++) {
                        let tpl = normTpl;
                        if (i === 0 && firstTpl) tpl = firstTpl;
                        else if (i === node.children.length - 1 && lastTpl) tpl = lastTpl;

                        let childStr = tpl.replace(/\{\{child\}\}/g, evaluateNode(node.children[i], node));
                        childStr = childStr.replace(/\{\{childValue\}\}/g, node.children[i].value);
                        childrenResult += childStr;
                    }
                }

                // Strip the children tags and replace with result
                str = str.replace(/\[children:first\][\s\S]*?\[\/children:first\]/g, '');
                str = str.replace(/\[children:last\][\s\S]*?\[\/children:last\]/g, '');
                str = str.replace(/\[children\][\s\S]*?\[\/children\]/g, childrenResult);
            }

            return str;
        };

        const nestedTreeStr = evaluateNode(treeRoot, null);

        // 3. Final Assembly
        template = template.replace(/\{\{nestedTree\}\}/g, nestedTreeStr);
        template = template.replace(/\{\{mode\}\}/g, mode);
        template = template.replace(/\{\{rootValue\}\}/g, treeRoot ? treeRoot.value : "NULL");

        // 4. Extract Hooks and clean lines
        const hooks = {};
        const hookTags = ['enter', 'visit', 'move:left', 'move:middle', 'move:right', 'move:next'];
        
        const rawLines = template.split(/\r?\n/);
        const cleanLines = [];

        rawLines.forEach((line) => {
            let cleanLine = line;
            hookTags.forEach(tag => {
                const openTag = `[${tag}]`;
                const closeTag = `[/${tag}]`;
                if (cleanLine.includes(openTag)) {
                    hooks[tag] = cleanLines.length + 1;
                    cleanLine = cleanLine.replace(openTag, '').replace(closeTag, '');
                }
            });
            cleanLines.push(cleanLine);
        });

        return {
            code: cleanLines.join('\n').trim(),
            hooks: hooks
        };
    }

    processArity(text, currentArity) {
        if (!text) return text;
        const arities = ['binary', 'ternary', 'nary'];
        
        let result = text;
        arities.forEach(a => {
            const isMatch = (a === currentArity);
            
            // If the arity matches, strip the positive tags but KEEP the content
            // If the arity DOES NOT match, remove the positive tags AND their content
            const positiveRegex = new RegExp(`\\[${a}\\]([\\s\\S]*?)\\[\\/${a}\\]`, 'g');
            if (isMatch) {
                result = result.replace(positiveRegex, '$1');
            } else {
                result = result.replace(positiveRegex, '');
            }

            // For negative tags [!arity]
            // If the arity matches, remove the negative tags AND their content
            // If the arity DOES NOT match, strip the negative tags but KEEP the content
            const negativeRegex = new RegExp(`\\[!${a}\\]([\\s\\S]*?)\\[\\/!${a}\\]`, 'g');
            if (isMatch) {
                result = result.replace(negativeRegex, '');
            } else {
                result = result.replace(negativeRegex, '$1');
            }
        });
        
        return result;
    }
}
