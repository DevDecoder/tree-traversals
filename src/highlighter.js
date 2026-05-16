export class Highlighter {
    static highlight(code, lang) {
        if (!code) return '';
        
        // Escape HTML
        let escaped = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

        const rules = this.getRules(lang);
        
        let result = escaped;
        rules.forEach(rule => {
            result = result.replace(rule.regex, rule.replacement);
        });

        return result;
    }

    static getRules(lang) {
        const common = [
            { regex: /(\/\/[^\n]*)/g, replacement: '<span class="hl-comment">$1</span>' },
            { regex: /(\/\*[\s\S]*?\*\/)/g, replacement: '<span class="hl-comment">$1</span>' },
            { regex: /("(?:[^"\\]|\\.)*")/g, replacement: '<span class="hl-string">$1</span>' },
            { regex: /('(?:[^'\\]|\\.)*')/g, replacement: '<span class="hl-string">$1</span>' },
            { regex: /\b(\d+)\b/g, replacement: '<span class="hl-number">$1</span>' }
        ];

        const keywords = {
            csharp: /\b(using|namespace|public|class|static|void|int|string|new|if|else|return|foreach|var|get|set|null|List)\b/g,
            java: /\b(import|public|class|static|void|int|String|new|if|else|return|for|null|List|ArrayList)\b/g,
            javascript: /\b(import|export|let|const|function|if|else|return|for|of|new|null|class|constructor|this)\b/g,
            python: /\b(import|from|def|if|elif|else|return|for|in|None|class|self)\b/g,
            sql: /\b(INSERT|INTO|VALUES|CREATE|TABLE|INT|PRIMARY|KEY|IF|ELSE|BEGIN|END|SELECT|FROM|WHERE)\b/gi,
            tsql: /\b(INSERT|INTO|VALUES|CREATE|TABLE|INT|PRIMARY|KEY|IF|ELSE|BEGIN|END|SELECT|FROM|WHERE|DECLARE|SET|EXEC)\b/gi
        };

        const langKeywords = keywords[lang] || keywords.javascript;
        
        return [
            ...common,
            { regex: langKeywords, replacement: '<span class="hl-keyword">$1</span>' },
            { regex: /\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*\()/g, replacement: '<span class="hl-function">$1</span>' }
        ];
    }
}
