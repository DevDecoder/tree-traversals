export class Node {
    constructor(id, value) {
        this.id = id;
        this.value = value;
        this.left = null;
        this.right = null;
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
                // After reaching minDepth, we have a chance to stop
                // But if minChildren is high, we're less likely to stop?
                // For now, let's just use a fixed probability to keep it simple
                shouldHaveChildren = Math.random() > 0.4;
            }

            if (shouldHaveChildren) {
                const numChildren = Math.floor(Math.random() * (maxChildren - minChildren + 1)) + minChildren;
                if (numChildren >= 1) node.left = createNode(depth + 1);
                if (numChildren >= 2) node.right = createNode(depth + 1);
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
            
            const offset = (right - left) / 2;
            assignPositions(node.left, left, node.x, y + levelHeight);
            assignPositions(node.right, node.x, right, y + levelHeight);
        };

        assignPositions(this.root, 0, canvasWidth, 60);
    }

    render(svg) {
        svg.innerHTML = '';
        if (!this.root) return;

        // Draw edges first so they are behind nodes
        const drawEdges = (node) => {
            if (!node) return;
            if (node.left) {
                this.createSVGElement('line', {
                    x1: node.x, y1: node.y,
                    x2: node.left.x, y2: node.left.y,
                    class: 'edge',
                    id: `edge-${node.id}-${node.left.id}`
                }, svg);
                drawEdges(node.left);
            }
            if (node.right) {
                this.createSVGElement('line', {
                    x1: node.x, y1: node.y,
                    x2: node.right.x, y2: node.right.y,
                    class: 'edge',
                    id: `edge-${node.id}-${node.right.id}`
                }, svg);
                drawEdges(node.right);
            }
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

            drawNodes(node.left);
            drawNodes(node.right);
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
