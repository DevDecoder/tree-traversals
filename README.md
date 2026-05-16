# Tree Traversal Explorer

An interactive, visual explorer for binary and n-ary tree traversal algorithms, designed for A-Level Computer Science students and anyone learning tree traversals for the first time.

🚀 **[Live demo →](https://pages.devdecoder.com/tree-traversals/)**

---

## Features

- **Three traversal algorithms** — Pre-order (Root, L, R), In-order (L, Root, R), Post-order (L, R, Root)
- **Animated step-by-step playback** with adjustable speed
- **Manual stepping** — click once to advance one step, hold to auto-step at the current speed
- **Configurable tree** — set min/max depth and min/max children per node; regenerate instantly with the ↻ button
- **Live code panel** — syntax-highlighted pseudocode in JavaScript, Python, or C#, with the active line highlighted as the traversal runs
- **Call stack panel** — real-time call stack visualisation showing recursive calls and their return values
- **Sequence bar** — the visited node sequence builds up as the traversal progresses
- **Dark / light theme toggle**
- **Resizable panels** — drag the dividers to customise the layout; hide the Code or Call Stack panels independently

---

## URL Parameters

You can customise the initial state of the application using URL parameters. This is useful for creating shareable links with specific configurations.

- `lang` — Set the initial language (e.g., `?lang=python`).
- `categories` — Filter the language dropdown to show only languages matching the specified categories (comma-separated, e.g., `?categories=AQA,OCR`).
- `code` — Toggle the visibility of the code panel (`true` or `false`).
- `callStack` — Toggle the visibility of the call stack panel (`true` or `false`).
- `traceLine` — Toggle the code line tracing (`true` or `false`).
- `focus` — Toggle focus mode, hiding boilerplate code (`true` or `false`).

---

## Running locally (self-hosting)

No build step is required — this is a plain HTML/CSS/JS application.

### Option 1 — `npx serve` (recommended)

```bash
git clone https://github.com/DevDecoder/tree-traversals.git
cd tree-traversals
npx serve .
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2 — Python simple server

```bash
git clone https://github.com/DevDecoder/tree-traversals.git
cd tree-traversals
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

### Option 3 — VS Code Live Server

Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer), open the repo folder, and click **Go Live** in the status bar.

> **Note:** The app uses ES modules (`type="module"`), so it must be served over HTTP — opening `index.html` directly as a `file://` URL will not work.

---

## Project structure

```
tree-traversals/
├── index.html          # Application shell
├── styles.css          # All styling
├── languages/          # Language template specifications (.lang files)
├── docs/               # Documentation
└── src/
    ├── main.js         # Entry point
    ├── ui.js           # UI controller — event handling, panel visibility, animation loop
    ├── tree.js         # Tree data structure and SVG renderer
    └── traversal.js    # Generator-based traversal algorithms and Animator class
```

---

## Deploying to GitHub Pages

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys the `main` branch to GitHub Pages on every push.

To enable it for a fork:

1. Go to **Settings → Pages** in your repository.
2. Set **Source** to **GitHub Actions**.
3. Push any change to `main` — the workflow will build and deploy automatically.

The live site will be available at `https://<your-username>.github.io/<repo-name>/`.

## Contributing

We welcome community contributions! The easiest way to get involved is by adding support for new programming languages or pseudocodes.

The application uses a custom, language-agnostic template format (`.lang`) to build code snippets and logic block highlighting. 

- Learn how to add a language: **[Contributing Guidelines](CONTRIBUTING.md)**
- Learn how the templating engine works: **[Language Format Reference](docs/LANGUAGE_FORMAT.md)**

---

## Licence

[MIT](LICENSE)
