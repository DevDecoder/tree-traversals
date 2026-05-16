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
            metaMatch[1].split('\n').forEach(line => {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const val = parts.slice(1).join(':').trim();
                    this.meta[key] = val;
                }
            });
            content = content.replace(/\[meta\][\s\S]*?\[\/meta\]\n?/, '');
        }

        // Extract structural blocks only (these don't appear in the final text directly)
        ['node', 'leaf', 'empty'].forEach(block => {
            const regex = new RegExp(`\\[${block}\\]([\\s\\S]*?)\\[\\/${block}\\]\\n?`);
            const match = content.match(regex);
            if (match) {
                this.blocks[block] = match[1].replace(/^\n/, '').replace(/\n$/, ''); 
                content = content.replace(regex, '');
            }
        });

        this.globalTemplate = content.trim();
    }

    generateCode(treeRoot, arity, mode) {
        let template = this.globalTemplate;
        
        // 1. Process Mode (Traversal blocks)
        ['preorder', 'inorder', 'postorder'].forEach(algo => {
            const regex = new RegExp(`\\[${algo}\\]([\\s\\S]*?)\\[\\/${algo}\\]\\n?`, 'g');
            // Check if this is the active mode
            const isActive = (mode === 'PRE' && algo === 'preorder') ||
                             (mode === 'IN' && algo === 'inorder') ||
                             (mode === 'POST' && algo === 'postorder');
            
            // Special rule: inorder is implicitly binary.
            // If the user selects inorder but we're in nary/ternary, it shouldn't show.
            const isValidArity = !(algo === 'inorder' && arity !== 'binary');

            if (isActive && isValidArity) {
                // Strip the tags but keep the content
                template = template.replace(regex, '$1');
            } else {
                // Completely remove the block
                template = template.replace(regex, '');
            }
        });

        // 2. Process Arity logic across the entire text space
        template = this.processArity(template, arity);
        
        // Process arity for the node templates too
        const nodeTpl = this.processArity(this.blocks.node, arity);
        const leafTpl = this.processArity(this.blocks.leaf || this.blocks.node, arity);
        const emptyTpl = this.processArity(this.blocks.empty, arity);

        // 2. Evaluate the Tree
        const evaluateNode = (node, parent) => {
            if (!node) return emptyTpl;

            const isLeaf = !node.left && !node.right && !node.middle && (!node.children || node.children.length === 0);
            let str = isLeaf ? leafTpl : nodeTpl;

            // Value replacements
            str = str.replace(/\{\{value\}\}/g, node.value !== undefined ? node.value : "NULL");
            str = str.replace(/\{\{parentValue\}\}/g, parent ? parent.value : "NULL");
            str = str.replace(/\{\{leftValue\}\}/g, node.left ? node.left.value : "NULL");
            str = str.replace(/\{\{middleValue\}\}/g, node.middle ? node.middle.value : "NULL");
            str = str.replace(/\{\{rightValue\}\}/g, node.right ? node.right.value : "NULL");

            // Recursive Replacements
            if (str.includes('{{left}}')) str = str.replace(/\{\{left\}\}/g, evaluateNode(node.left, node));
            if (str.includes('{{middle}}')) str = str.replace(/\{\{middle\}\}/g, evaluateNode(node.middle, node));
            if (str.includes('{{right}}')) str = str.replace(/\{\{right\}\}/g, evaluateNode(node.right, node));

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
        
        const rawLines = template.split('\n');
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
