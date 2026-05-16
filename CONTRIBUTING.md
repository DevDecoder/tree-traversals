# Contributing

We love contributions! The easiest way to contribute to the Tree Traversal Explorer is by adding or improving support for programming languages and pseudocode syntaxes.

## Adding a New Language

Our architecture is entirely language-agnostic. You can add a new language just by creating a `.lang` file inside the `languages/` directory.

1. Create a new file in `languages/` named after your language (e.g., `ruby.lang` or `pseudocode-edexcel.lang`).
2. Follow the [Language Format Documentation](LANGUAGE_FORMAT.md) to define how your language builds objects, declares classes, and writes its logic.
3. Test your `.lang` file.
4. When deploying, the `manifest.json` file is automatically built to detect all `.lang` files in the folder. You do not need to manually update the manifest.

### Guidelines for Language Templates
- **Be Idiomatic:** Write the code as it would be written by a seasoned developer in that language. Use the standard libraries and naming conventions of the language.
- **Support all Arities (if applicable):** Try to support Binary, Ternary, and N-ary tree structures. If a language is highly specific or limited (e.g. strict pseudocodes), you may only support Binary.
- **Use Inline Hooks:** Utilize `[nary]`, `[!nary]`, `[ternary]`, etc., to avoid duplicating classes or structure for different tree types.

### Category Guidance
The `.lang` format supports a `categories` metadata property. 
Forks of this repository are free to use categories in whatever way best suits their audience.
However, in **this** primary repository, we strictly use categories for **language descriptors** (e.g., `OOP`, `Relational`) and **exam boards**.
When specifying an exam board, you must prefix it with the country flag emoji (e.g., `🇬🇧 AQA`, `🇬🇧 OCR`, `🇬🇧 Edexcel`).

## Development Setup
If you want to run the project locally and add a new language:

1. Clone the repository.
2. Ensure you have Node.js installed.
3. Test your `.lang` syntax using `node scripts/validate-all.mjs` (this parses the template looking for syntax errors to ensure it will deploy).
4. Update your local manifest by running `node scripts/generate-manifest.mjs`. **Note: DO NOT commit changes to `manifest.json`.** The CI/CD pipeline dynamically regenerates the manifest upon deployment to guarantee it is up-to-date, so any checked-in changes will cause merge conflicts or be overwritten.
5. Run a local web server in the root directory (e.g. `npx serve .` or `python -m http.server`).
6. Access `index.html` to see the Tree Traversal Explorer in action.
