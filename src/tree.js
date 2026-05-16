export class Node {
    constructor(id, value) {
        this.id = id;
        this.value = value;
        this.children = [];
        this.x = 0;
        this.y = 0;
        this.depth = 0;
    }
}

export class Tree {
    constructor() {
        this.root = null;
        this.nodes = [];
    }

    generateRandom(minDepth, maxDepth, minChildren, maxChildren) {
        this.nodes = [];
        let idCounter = 0;

        const createNode = (depth) => {
            if (depth > maxDepth) return null;

            const value = Math.floor(Math.random() * 100);
            const node = new Node(idCounter++, value);
            node.depth = depth;
            this.nodes.push(node);

            // Determine if this node should have children
            let shouldHaveChildren = true;
            if (depth >= maxDepth) {
                shouldHaveChildren = false;
            } else if (depth >= minDepth) {
                shouldHaveChildren = Math.random() > 0.4;
            }

            if (shouldHaveChildren) {
                const numChildren = Math.floor(Math.random() * (maxChildren - minChildren + 1)) + minChildren;
                for (let i = 0; i < numChildren; i++) {
                    const child = createNode(depth + 1);
                    if (child) node.children.push(child);
                }
            }

            return node;
        };

        this.root = createNode(1);
        this.calculatePositions();
    }

    calculatePositions() {
        if (!this.root) return;

        const canvasWidth = 800;
        const canvasHeight = 600;
        const levelHeight = canvasHeight / 6;

        const assignPositions = (node, left, right, y) => {
            if (!node) return;
            node.x = (left + right) / 2;
            node.y = y;
            
            const numChildren = node.children.length;
            if (numChildren > 0) {
                const childWidth = (right - left) / numChildren;
                node.children.forEach((child, i) => {
                    assignPositions(child, left + i * childWidth, left + (i + 1) * childWidth, y + levelHeight);
                });
            }
        };

        assignPositions(this.root, 0, canvasWidth, 60);
    }

    render(svg) {
        svg.innerHTML = '';
        if (!this.root) return;

        const drawEdges = (node) => {
            if (!node) return;
            node.children.forEach(child => {
                this.createSVGElement('line', {
                    x1: node.x, y1: node.y,
                    x2: child.x, y2: child.y,
                    class: 'edge',
                    id: `edge-${node.id}-${child.id}`
                }, svg);
                drawEdges(child);
            });
        };

        const drawNodes = (node) => {
            if (!node) return;
            const group = this.createSVGElement('g', { class: 'node-group' }, svg);
            
            this.createSVGElement('circle', {
                cx: node.x, cy: node.y, r: 20,
                class: 'node',
                id: `node-${node.id}`
            }, group);

            const text = this.createSVGElement('text', {
                x: node.x, y: node.y + 5,
                'text-anchor': 'middle',
                class: 'node-label'
            }, group);
            text.textContent = node.value;

            node.children.forEach(child => drawNodes(child));
        };

        drawEdges(this.root);
        drawNodes(this.root);
    }

    createSVGElement(tag, attrs, parent) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (let k in attrs) el.setAttribute(k, attrs[k]);
        parent.appendChild(el);
        return el;
    }
}
