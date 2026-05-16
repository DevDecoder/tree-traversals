# Tree Traversal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a modern, interactive web tool to demonstrate tree traversals with code snippets in JS, Python, and C#, plus a call stack and trace line visualization.

**Architecture:** A modular vanilla Javascript application using SVG for visualization. Logic is separated into tree management, traversal algorithms, and UI control.

**Tech Stack:** HTML5, CSS3 (Glassmorphism), Vanilla JS, SVG.

---

### Task 1: Foundation and Styling
**Files:**
- Create: `index.html`
- Create: `styles.css`

- [ ] **Step 1: Create the HTML skeleton**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tree Traversal Visualizer</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Tree Traversal Explorer</h1>
    </header>
    <main>
        <aside id="controls">
            <!-- Tree Config & Playback -->
        </aside>
        <section id="visualization">
            <svg id="tree-canvas"></svg>
        </section>
        <aside id="insights">
            <!-- Toggles, Code, Stack -->
        </aside>
    </main>
    <footer id="results-bar"></footer>
    <script type="module" src="src/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Define CSS Variables and Layout**
```css
:root {
    --bg-color: #0f172a;
    --node-color: #38bdf8;
    --active-color: #f472b6;
    --edge-color: #334155;
    --glass-bg: rgba(255, 255, 255, 0.05);
}
body { background: var(--bg-color); color: white; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
main { display: flex; flex: 1; overflow: hidden; }
#visualization { flex: 1; position: relative; }
#tree-canvas { width: 100%; height: 100%; }
```

- [ ] **Step 3: Commit foundation**
```bash
git add index.html styles.css
git commit -m "feat: initial project structure and styles"
```

### Task 2: Core Tree Data Structure & Rendering
**Files:**
- Create: `src/tree.js`

- [ ] **Step 1: Implement Node and Tree generation**
```javascript
export class Node {
    constructor(id, value) {
        this.id = id;
        this.value = value;
        this.left = null;
        this.right = null;
        this.x = 0;
        this.y = 0;
    }
}
export function generateRandomTree(depth, maxChildren) { /* ... */ }
```

- [ ] **Step 2: Implement SVG Rendering**
```javascript
export function renderTree(svg, root) {
    svg.innerHTML = '';
    // Draw edges then nodes
}
```

- [ ] **Step 3: Commit tree logic**
```bash
git add src/tree.js
git commit -m "feat: add tree data structure and rendering"
```

### Task 3: Traversal Algorithms & Animation
**Files:**
- Create: `src/traversal.js`

- [ ] **Step 1: Implement Pre, In, Post order generators**
```javascript
export function* preorder(node) {
    if (!node) return;
    yield { type: 'visit', node, side: 'left' };
    yield* preorder(node.left);
    yield* preorder(node.right);
}
```

- [ ] **Step 2: Implement Animation Controller**
```javascript
export class Animator {
    constructor(generator) { this.gen = generator; }
    async step() { /* update UI */ }
}
```

- [ ] **Step 3: Commit traversal logic**
```bash
git add src/traversal.js
git commit -m "feat: add traversal generators and animator"
```

### Task 4: UI Controls & Toggles
**Files:**
- Create: `src/ui.js`

- [ ] **Step 1: Bind sliders and buttons**
- [ ] **Step 2: Implement show/hide toggles**
- [ ] **Step 3: Commit UI logic**

### Task 5: Code Snippets & Call Stack
**Files:**
- Create: `src/snippets.js`
- Modify: `index.html`

- [ ] **Step 1: Add JS/Python/C# snippet templates**
- [ ] **Step 2: Implement Call Stack UI update**
- [ ] **Step 3: Final polish and commit**
