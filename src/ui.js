import { Tree } from './tree.js';
import { Animator, preorder, inorder, postorder } from './traversal.js';
import { getSnippets } from './snippets.js';

let tree = new Tree();
let animator = null;
let currentTraversal = 'preorder';
let currentLang = 'js';

const els = {
    canvas: document.getElementById('tree-canvas'),
    minDepth: document.getElementById('min-depth-slider'),
    maxDepth: document.getElementById('max-depth-slider'),
    minChild: document.getElementById('min-child-slider'),
    maxChild: document.getElementById('max-child-slider'),
    depthRange: document.getElementById('depth-range'),
    childRange: document.getElementById('child-range'),
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
    const updateRanges = () => {
        els.depthRange.textContent = `${els.minDepth.value} - ${els.maxDepth.value}`;
        els.childRange.textContent = `${els.minChild.value} - ${els.maxChild.value}`;
    };

    els.minDepth.oninput = updateRanges;
    els.maxDepth.oninput = updateRanges;
    els.minChild.oninput = updateRanges;
    els.maxChild.oninput = updateRanges;
    
    els.btnGenerate.onclick = regenerate;
    
    els.traversalSelect.onchange = (e) => {
        currentTraversal = e.target.value;
        reset();
        updateCode();
    };

    els.langSelect.onchange = (e) => {
        currentLang = e.target.value;
        updateCode();
        refreshStack();
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
    const minD = parseInt(els.minDepth.value);
    const maxD = parseInt(els.maxDepth.value);
    const minC = parseInt(els.minChild.value);
    const maxC = parseInt(els.maxChild.value);
    
    // Safety check: min should not exceed max
    tree.generateRandom(
        Math.min(minD, maxD), Math.max(minD, maxD),
        Math.min(minC, maxC), Math.max(minC, maxC)
    );
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
    const lineEls = els.codeDisplay.querySelectorAll('.code-line');
    lineEls.forEach(l => l.classList.remove('highlight'));

    const lines = Array.from(lineEls).map(el => el.textContent);
    let targetIndex = -1;
    
    if (type === 'visit') {
        targetIndex = lines.findIndex(l => l.includes('console.log') || l.includes('print') || l.includes('Console.WriteLine'));
    } else if (side === 'left') {
        targetIndex = lines.findIndex(l => l.includes('.left') || l.includes('.Left'));
    } else if (side === 'right') {
        targetIndex = lines.findIndex(l => l.includes('.right') || l.includes('.Right'));
    }

    if (targetIndex !== -1 && lineEls[targetIndex]) {
        lineEls[targetIndex].classList.add('highlight');
    }
}

function addToSequence(val) {
    const item = document.createElement('div');
    item.className = 'seq-item highlight-new';
    item.textContent = val;
    els.sequenceList.appendChild(item);
}

function updateStack(node, type) {
    const frames = els.stackDisplay.querySelectorAll('.stack-frame');
    const lastFrame = frames[frames.length - 1];

    if (type === 'enter') {
        const frame = document.createElement('div');
        frame.className = 'stack-frame';
        frame.dataset.nodeValue = node.value;
        frame.textContent = getStackLabel(node.value);
        els.stackDisplay.appendChild(frame);
    } else if (type === 'visit') {
        if (lastFrame) {
            lastFrame.classList.add('active-visit');
            const result = document.createElement('span');
            result.className = 'print-result';
            result.textContent = ` -> ${node.value}`;
            lastFrame.appendChild(result);
        }
    } else if (type === 'exit') {
        if (frames.length > 0) {
            lastFrame.classList.add('exit-animation');
            setTimeout(() => lastFrame.remove(), 200);
        }
    }
}

function getStackLabel(val) {
    let funcName = currentTraversal;
    if (currentLang === 'csharp') {
        funcName = currentTraversal.charAt(0).toUpperCase() + currentTraversal.slice(1);
    }
    return `${funcName}(${val})`;
}

function refreshStack() {
    const frames = els.stackDisplay.querySelectorAll('.stack-frame');
    frames.forEach(frame => {
        if (frame.dataset.nodeValue) {
            frame.textContent = getStackLabel(frame.dataset.nodeValue);
        }
    });
}

function updateCode() {
    const snippets = getSnippets(currentLang, currentTraversal);
    els.codeDisplay.innerHTML = snippets.split('\n')
        .map(line => `<span class="code-line">${line}</span>`)
        .join('\n');
}
