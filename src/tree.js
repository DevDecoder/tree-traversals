export class Node {
    constructor(id, value) {
        this.id = id;
        this.value = value;
        this.children = [];
        this.x = 0;
        this.y = 0;
        this.status = 'idle'; // idle, active, visited
    }
}

export class Tree {
    constructor() {
        this.root = null;
        this.nodes = [];
        this.currentWidth = 800;
        this.currentHeight = 600;
    }

    generateRandom(minDepth = 2, maxDepth = 4, minChildren = 2, maxChildren = 2) {
        this.nodes = [];
        let idCounter = 1;

        const createNode = (depth) => {
            const node = new Node(idCounter++, Math.floor(Math.random() * 90) + 10);
            this.nodes.push(node);

            if (depth < maxDepth) {
                const numChildren = (depth < minDepth) ? maxChildren : Math.floor(Math.random() * (maxChildren - minChildren + 1)) + minChildren;
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

        const baseWidth = 800;
        const baseHeight = 600;
        const minLeafSpacing = 60;
        const minLevelHeight = 100;
        
        const calculateSubtreeWidth = (node) => {
            if (node.children.length === 0) {
                node.width = 1;
                return 1;
            }
            let width = 0;
            node.children.forEach(child => {
                width += calculateSubtreeWidth(child);
            });
            node.width = width;
            return width;
        };
        const totalLeaves = calculateSubtreeWidth(this.root);

        let maxDepth = 0;
        const findMaxDepth = (node, depth) => {
            maxDepth = Math.max(maxDepth, depth);
            node.children.forEach(c => findMaxDepth(c, depth + 1));
        };
        findMaxDepth(this.root, 1);

        this.currentWidth = Math.max(baseWidth, totalLeaves * minLeafSpacing);
        this.currentHeight = Math.max(baseHeight, maxDepth * minLevelHeight);
        
        const canvasWidth = this.currentWidth;
        const canvasHeight = this.currentHeight;

        const paddingX = 40;
        const topPadding = 60;
        const bottomPadding = 60;
        const levelHeight = maxDepth > 1 ? (canvasHeight - topPadding - bottomPadding) / (maxDepth - 1) : 0;
        const leafSpacing = (canvasWidth - paddingX * 2) / totalLeaves;

        const assign = (node, startX, depth) => {
            const allocatedWidth = node.width * leafSpacing;
            node.x = startX + allocatedWidth / 2;
            node.y = topPadding + (depth - 1) * levelHeight;

            let currentX = startX;
            node.children.forEach(child => {
                assign(child, currentX, depth + 1);
                currentX += child.width * leafSpacing;
            });
        };

        assign(this.root, paddingX, 1);
        if (maxDepth === 1) this.root.y = canvasHeight / 2;
    }

    render(svg) {
        svg.innerHTML = '';
        // Explicitly set viewBox to match calculated dimensions
        svg.setAttribute('viewBox', `0 0 ${this.currentWidth} ${this.currentHeight}`);
        
        // Layers to ensure edges are always behind nodes
        const edgesLayer = this.createSVGElement('g', { class: 'edges-layer' }, svg);
        const nodesLayer = this.createSVGElement('g', { class: 'nodes-layer' }, svg);

        const drawEdges = (node) => {
            if (!node) return;
            node.children.forEach(child => {
                this.createSVGElement('line', {
                    x1: node.x, y1: node.y,
                    x2: child.x, y2: child.y,
                    class: 'edge',
                    id: `edge-${node.id}-${child.id}`
                }, edgesLayer);
                drawEdges(child);
            });
        };

        const drawNodes = (node) => {
            if (!node) return;
            const group = this.createSVGElement('g', { class: 'node-group' }, nodesLayer);
            
            this.createSVGElement('circle', {
                cx: node.x, cy: node.y, r: 20,
                class: `node ${node.status}`,
                id: `node-${node.id}`,
                'data-id': node.id
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
