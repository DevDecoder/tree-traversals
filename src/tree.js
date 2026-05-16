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
        
        // Calculate max depth for vertical spacing
        let maxDepth = 0;
        const findMaxDepth = (node, depth) => {
            if (!node) return;
            maxDepth = Math.max(maxDepth, depth);
            node.children.forEach(child => findMaxDepth(child, depth + 1));
        };
        findMaxDepth(this.root, 1);
        
        const levelHeight = canvasHeight / (maxDepth + 1);
        
        // In-order traversal to assign X coordinates
        // This ensures that for any node, all nodes in its left subtree are to its left,
        // and all nodes in its right subtree are to its right.
        let xCounter = 0;
        const assignX = (node, depth) => {
            if (!node) return;
            
            // For n-ary, we visit: first_child, root, rest_of_children
            if (node.children.length > 0) {
                assignX(node.children[0], depth + 1);
            }
            
            node.x = ++xCounter;
            node.y = depth * levelHeight;
            
            for (let i = 1; i < node.children.length; i++) {
                assignX(node.children[i], depth + 1);
            }
        };

        assignX(this.root, 1);

        // Normalize X coordinates to fit canvas with padding
        const paddingX = 80;
        const availableWidth = canvasWidth - paddingX * 2;
        const xSpacing = xCounter > 1 ? availableWidth / (xCounter - 1) : 0;
        
        // Normalize Y coordinates with padding
        const topPadding = 60;
        const bottomPadding = 60;
        const availableHeight = canvasHeight - topPadding - bottomPadding;
        const ySpacing = maxDepth > 1 ? availableHeight / (maxDepth - 1) : 0;

        this.nodes.forEach(node => {
            node.x = paddingX + (node.x - 1) * xSpacing;
            if (xCounter === 1) node.x = canvasWidth / 2;
            
            node.y = topPadding + (node.depth - 1) * ySpacing;
            if (maxDepth === 1) node.y = canvasHeight / 2;
        });
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
