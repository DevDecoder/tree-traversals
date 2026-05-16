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
    item.className = 'seq-item';
    item.textContent = val;
    els.sequenceList.appendChild(item);
}

function updateStack(node, type) {
    if (type === 'enter') {
        const frame = document.createElement('div');
        frame.className = 'stack-frame';
        
        let funcName = currentTraversal;
        if (currentLang === 'csharp') {
            funcName = currentTraversal.charAt(0).toUpperCase() + currentTraversal.slice(1);
        }
        
        frame.textContent = `${funcName}(${node.value})`;
        els.stackDisplay.appendChild(frame);
    } else if (type === 'exit') {
        const frames = els.stackDisplay.querySelectorAll('.stack-frame');
        if (frames.length > 0) {
            const lastFrame = frames[frames.length - 1];
            lastFrame.classList.add('exit-animation');
            setTimeout(() => lastFrame.remove(), 200);
        }
    }
}

function updateCode() {
    const snippets = getSnippets(currentLang, currentTraversal);
    els.codeDisplay.innerHTML = snippets.split('\n')
        .map(line => `<span class="code-line">${line}</span>`)
        .join('\n');
}
