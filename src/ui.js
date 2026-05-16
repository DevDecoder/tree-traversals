import { Tree } from './tree.js';
import { Animator, preorder, inorder, postorder } from './traversal.js';
import { getSnippets } from './snippets.js';

let tree = new Tree();
let animator = null;
let currentTraversal = 'preorder';
let currentLang = 'js';

const els = {
    canvas: document.getElementById('tree-canvas'),
    depthSlider: document.getElementById('depth-slider'),
    childSlider: document.getElementById('child-slider'),
    depthVal: document.getElementById('depth-val'),
    childVal: document.getElementById('child-val'),
    btnGenerate: document.getElementById('btn-generate'),
    traversalSelect: document.getElementById('traversal-select'),
    btnPlay: document.getElementById('btn-play'),
    btnStep: document.getElementById('btn-step'),
    btnReset: document.getElementById('btn-reset'),
    speedSlider: document.getElementById('speed-slider'),
    langSelect: document.getElementById('lang-select'),
    codeDisplay: document.querySelector('#code-display code'),
    stackDisplay: document.getElementById('stack-display'),
    sequenceList: document.getElementById('sequence-list')
};

export function init() {
    setupEventListeners();
    regenerate();
    updateCode();
}

function setupEventListeners() {
    els.depthSlider.oninput = (e) => { els.depthVal.textContent = e.target.value; };
    els.childSlider.oninput = (e) => { els.childVal.textContent = e.target.value; };
    
    els.btnGenerate.onclick = regenerate;
    
    els.traversalSelect.onchange = (e) => {
        currentTraversal = e.target.value;
        reset();
        updateCode();
    };

    els.langSelect.onchange = (e) => {
        currentLang = e.target.value;
        updateCode();
    };

    els.btnPlay.onclick = () => {
        if (!animator || animator.isFinished) {
            els.sequenceList.innerHTML = '';
            startTraversal();
        }
        else if (animator.isPlaying) {
            animator.pause();
            els.btnPlay.textContent = 'Play';
        } else {
            animator.resume();
            els.btnPlay.textContent = 'Pause';
        }
    };

    els.btnStep.onclick = () => {
        if (!animator || animator.isFinished) {
            els.sequenceList.innerHTML = '';
            startTraversal(true);
        }
        else animator.manualStep();
    };

    els.btnReset.onclick = reset;
    
    els.speedSlider.oninput = (e) => {
        if (animator) animator.setSpeed(e.target.value);
    };

    // Visibility Toggles
    document.getElementById('check-trace').onchange = (e) => {
        // Trace line visibility handled in CSS or JS
    };
    document.getElementById('check-stack').onchange = (e) => {
        document.getElementById('stack-panel').style.display = e.target.checked ? 'flex' : 'none';
    };
    document.getElementById('check-code').onchange = (e) => {
        document.getElementById('code-panel').style.display = e.target.checked ? 'flex' : 'none';
    };
}

function regenerate() {
    reset();
    tree.generateRandom(parseInt(els.depthSlider.value), parseInt(els.childSlider.value));
    tree.render(els.canvas);
}

function reset() {
    if (animator) animator.pause();
    animator = null;
    els.btnPlay.textContent = 'Play';
    els.sequenceList.innerHTML = '';
    els.stackDisplay.innerHTML = '';
    document.querySelectorAll('.node').forEach(n => n.classList.remove('active', 'visited'));
    updateCode();
}

function startTraversal(manual = false) {
    const genFunc = { preorder, inorder, postorder }[currentTraversal];
    animator = new Animator({
        onStep: handleStep,
        onComplete: () => {
            els.btnPlay.textContent = 'Play';
            console.log('Traversal Complete');
        }
    });
    animator.setSpeed(els.speedSlider.value);
    
    if (manual) animator.manualStep(genFunc(tree.root));
    else {
        animator.start(genFunc(tree.root));
        els.btnPlay.textContent = 'Pause';
    }
}

async function handleStep(step) {
    const { type, node, side } = step;
    
    // Reset highlights
    document.querySelectorAll('.node').forEach(n => n.classList.remove('active'));
    
    const nodeEl = document.getElementById(`node-${node.id}`);
    nodeEl.classList.add('active');
    
    if (type === 'visit') {
        nodeEl.classList.add('visited');
        addToSequence(node.value);
    }
    
    updateStack(node, type);
    
    // Highlight code line based on side
    const lines = els.codeDisplay.textContent.split('\n');
    let targetIndex = -1;
    if (type === 'visit') {
        targetIndex = lines.findIndex(l => l.includes('console.log') || l.includes('print') || l.includes('Console.WriteLine'));
    } else if (side === 'left') {
        targetIndex = lines.findIndex(l => l.includes('left'));
    } else if (side === 'right') {
        targetIndex = lines.findIndex(l => l.includes('right'));
    }

    if (targetIndex !== -1) {
        const codeText = els.codeDisplay.textContent;
        // Simple visual highlight by wrapping text? No, better to just update a line pointer
        // For V1, we'll just log it or add a class to a line if we had line wrapping
    }
}

function addToSequence(val) {
    const item = document.createElement('div');
    item.className = 'seq-item';
    item.textContent = val;
    els.sequenceList.appendChild(item);
}

function updateStack(node, type) {
    // Simple stack visualization logic
    // In a real recursive viz, we'd track depth more accurately
    if (type === 'visit') {
        const frame = document.createElement('div');
        frame.className = 'stack-frame';
        frame.textContent = `visit(${node.value})`;
        els.stackDisplay.appendChild(frame);
        setTimeout(() => frame.remove(), 1000); // Visual flair
    }
}

function updateCode() {
    const snippets = getSnippets(currentLang, currentTraversal);
    els.codeDisplay.textContent = snippets;
}
