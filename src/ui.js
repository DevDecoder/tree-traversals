import { Tree } from './tree.js';
import { Animator, preorder, inorder, postorder } from './traversal.js';
import { getSnippets } from './snippets.js';

let tree = new Tree();
let animator = null;
let currentTraversal = 'preorder';
let currentLang = 'js';

const els = {};

export function init() {
    // Initialize elements inside init to ensure DOM is ready
    els.canvas = document.getElementById('tree-canvas');
    els.minDepth = document.getElementById('min-depth-slider');
    els.maxDepth = document.getElementById('max-depth-slider');
    els.minChild = document.getElementById('min-child-slider');
    els.maxChild = document.getElementById('max-child-slider');
    els.depthRange = document.getElementById('depth-range');
    els.childRange = document.getElementById('child-range');
    els.traversalSelect = document.getElementById('traversal-select');
    els.btnPlay = document.getElementById('btn-play');
    els.btnStep = document.getElementById('btn-step');
    els.btnReset = document.getElementById('btn-reset');
    els.speedSlider = document.getElementById('speed-slider');
    els.langSelect = document.getElementById('lang-select');
    els.codeDisplay = document.querySelector('#code-display code');
    els.stackDisplay = document.getElementById('stack-display');
    els.sequenceList = document.getElementById('sequence-list');
    els.checkCode = document.getElementById('check-code');
    els.checkStack = document.getElementById('check-stack');
    els.btnCopy = document.getElementById('btn-copy');
    els.btnHideCode = document.getElementById('btn-hide-code');
    els.btnHideStack = document.getElementById('btn-hide-stack');
    els.resizerH = document.getElementById('resizer');
    els.resizerV = document.getElementById('v-resizer');
    els.codePanel = document.getElementById('code-panel');
    els.stackPanel = document.getElementById('stack-panel');
    els.insights = document.getElementById('insights');
    els.btnRegenerate = document.getElementById('btn-regenerate');

    setupEventListeners();
    regenerate();
}

// Syncs the Play button's label AND colour class with the current state.
function syncPlayButton(label) {
    els.btnPlay.textContent = label;
    els.btnPlay.classList.toggle('btn-play--paused', label === 'Resume');
}

function setupEventListeners() {
    const updateRanges = () => {
        els.depthRange.textContent = `${els.minDepth.value} - ${els.maxDepth.value}`;
        els.childRange.textContent = `${els.minChild.value} - ${els.maxChild.value}`;
    };

    els.minDepth.oninput = () => {
        if (parseInt(els.minDepth.value) > parseInt(els.maxDepth.value)) {
            els.maxDepth.value = els.minDepth.value;
        }
        updateRanges();
        regenerate();
    };
    els.maxDepth.oninput = () => {
        if (parseInt(els.maxDepth.value) < parseInt(els.minDepth.value)) {
            els.minDepth.value = els.maxDepth.value;
        }
        updateRanges();
        regenerate();
    };
    els.minChild.oninput = () => {
        if (parseInt(els.minChild.value) > parseInt(els.maxChild.value)) {
            els.maxChild.value = els.minChild.value;
        }
        updateRanges();
        updateInOrderAvailability();
        regenerate();
    };
    els.maxChild.oninput = () => {
        if (parseInt(els.maxChild.value) < parseInt(els.minChild.value)) {
            els.minChild.value = els.maxChild.value;
        }
        updateRanges();
        updateInOrderAvailability();
        regenerate();
    };
    
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

    els.checkCode.onchange = () => updateVisibility();
    els.checkStack.onchange = () => updateVisibility();
    els.btnHideCode.onclick = () => { els.checkCode.checked = false; updateVisibility(); };
    els.btnHideStack.onclick = () => { els.checkStack.checked = false; updateVisibility(); };

    // Initial visibility
    updateVisibility();

    els.btnCopy.onclick = () => {
        const code = getSnippets(currentLang, currentTraversal, tree, parseInt(els.maxChild.value), false);
        navigator.clipboard.writeText(code).then(() => {
            const originalText = els.btnCopy.textContent;
            els.btnCopy.textContent = 'Copied!';
            setTimeout(() => { els.btnCopy.textContent = originalText; }, 2000);
        });
    };

    els.btnPlay.onclick = () => {
        if (!animator || animator.isFinished) {
            els.sequenceList.innerHTML = '';
            startTraversal();
        }
        else if (animator.isPlaying) {
            animator.pause();
            syncPlayButton('Resume');
        } else {
            animator.resume();
            syncPlayButton('Pause');
        }
    };

    // Step: single click → one step; hold → continuous stepping at speed
    let holdStepTimer = null;

    function doStep() {
        if (!animator || animator.isFinished) {
            els.sequenceList.innerHTML = '';
            startTraversal(true);
            return;
        }
        if (animator.isPlaying) {
            animator.pause();
            syncPlayButton('Resume');
        }
        animator.manualStep();
    }

    function startHoldStep() {
        const scheduleNext = () => {
            if (holdStepTimer === null) return; // cancelled
            const delay = animator ? animator.speed : 500;
            holdStepTimer = setTimeout(() => {
                if (!animator || animator.isFinished) {
                    stopHoldStep();
                    return;
                }
                animator.manualStep();
                scheduleNext();
            }, delay);
        };
        holdStepTimer = true; // mark as active before first tick
        scheduleNext();
    }

    function stopHoldStep() {
        if (holdStepTimer !== null) {
            clearTimeout(holdStepTimer);
            holdStepTimer = null;
        }
    }

    // How long the user must hold before continuous stepping begins (ms)
    const HOLD_THRESHOLD = 400;
    let holdStepStartTimer = null;

    els.btnStep.addEventListener('mousedown', () => {
        doStep(); // immediate single step on press
        holdStepStartTimer = setTimeout(() => {
            startHoldStep();
        }, HOLD_THRESHOLD);
    });

    const cancelHold = () => {
        clearTimeout(holdStepStartTimer);
        holdStepStartTimer = null;
        stopHoldStep();
    };

    els.btnStep.addEventListener('mouseup', cancelHold);
    els.btnStep.addEventListener('mouseleave', cancelHold);

    els.btnReset.onclick = reset;

    els.btnRegenerate.addEventListener('click', () => {
        els.btnRegenerate.classList.add('spinning');
        els.btnRegenerate.addEventListener('animationend', () => {
            els.btnRegenerate.classList.remove('spinning');
        }, { once: true });
        regenerate();
    });

    els.speedSlider.oninput = (e) => {
        if (animator) animator.setSpeed(parseInt(e.target.value));
    };

    // Horizontal Resizer
    let isResizingH = false;
    els.resizerH.onmousedown = (e) => {
        isResizingH = true;
        document.body.style.cursor = 'col-resize';
        e.preventDefault();
    };

    // Vertical Resizer
    let isResizingV = false;
    els.resizerV.onmousedown = (e) => {
        isResizingV = true;
        document.body.style.cursor = 'row-resize';
        e.preventDefault();
    };

    document.addEventListener('mousemove', (e) => {
        if (isResizingH) {
            const width = window.innerWidth - e.clientX;
            if (width > 250 && width < window.innerWidth * 0.8) {
                els.insights.style.width = `${width}px`;
            }
        }
        if (isResizingV) {
            const rect = els.insights.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const topRatio = y / rect.height;
            const bottomRatio = 1 - topRatio;
            if (topRatio > 0.1 && bottomRatio > 0.1) {
                els.codePanel.style.flex = topRatio;
                els.stackPanel.style.flex = bottomRatio;
            }
        }
    });

    document.addEventListener('mouseup', () => {
        isResizingH = false;
        isResizingV = false;
        document.body.style.cursor = 'default';
    });

    updateInOrderAvailability();
}

function updateInOrderAvailability() {
    const maxChildren = parseInt(els.maxChild.value);
    const inOrderOption = els.traversalSelect.querySelector('option[value="inorder"]');
    
    if (maxChildren > 2) {
        inOrderOption.disabled = true;
        if (currentTraversal === 'inorder') {
            els.traversalSelect.value = 'preorder';
            currentTraversal = 'preorder';
            updateCode();
        }
    } else {
        inOrderOption.disabled = false;
    }
}

function regenerate() {
    reset();
    const minD = parseInt(els.minDepth.value);
    const maxD = parseInt(els.maxDepth.value);
    const minC = parseInt(els.minChild.value);
    const maxC = parseInt(els.maxChild.value);
    
    tree.nodes = [];
    tree.root = null;

    tree.generateRandom(
        Math.min(minD, maxD), Math.max(minD, maxD),
        Math.min(minC, maxC), Math.max(minC, maxC)
    );
    tree.render(els.canvas);
    updateCode();
}

function reset() {
    if (animator) animator.pause();
    animator = null;
    syncPlayButton('Start');
    els.stackDisplay.innerHTML = '';
    els.sequenceList.innerHTML = '';
    tree.nodes.forEach(n => { n.status = 'idle'; });
    tree.render(els.canvas);
}

function startTraversal(manual = false) {
    reset();
    const strategy = currentTraversal === 'preorder' ? preorder : 
                    (currentTraversal === 'inorder' ? inorder : postorder);
    
    animator = new Animator({
        onStep: handleStep,
        onComplete: () => {
            syncPlayButton('Restart');
        }
    });
    
    animator.setSpeed(parseInt(els.speedSlider.value));
    
    if (manual) {
        animator.manualStep(strategy(tree.root));
    } else {
        animator.start(strategy(tree.root));
        syncPlayButton('Pause');
    }
}

async function handleStep(step) {
    const { type, node, side } = step;
    
    if (type === 'enter') {
        node.status = 'active';
        pushStack(node);
    } else if (type === 'exit') {
        node.status = 'visited';
        popStack();
    } else if (type === 'visit') {
        const item = document.createElement('div');
        item.className = 'sequence-item';
        item.textContent = node.value;
        els.sequenceList.appendChild(item);
        
        const currentFrame = els.stackDisplay.querySelector('.stack-frame.active');
        if (currentFrame) {
            const printRes = document.createElement('span');
            printRes.className = 'print-result';
            printRes.textContent = ` -> ${node.value}`;
            currentFrame.appendChild(printRes);
        }
    }

    tree.render(els.canvas);
    
    // Auto-scroll the active node into view
    const activeNodeEl = document.querySelector(`[data-id="${node.id}"]`);
    if (activeNodeEl) {
        activeNodeEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }

    // Highlight code line
    const lineEls = els.codeDisplay.querySelectorAll('.code-line');
    lineEls.forEach(l => l.classList.remove('highlight'));

    const lines = Array.from(lineEls).map(el => el.textContent);
    
    const funcNameNeedle = currentLang === 'csharp' 
        ? `${currentTraversal.charAt(0).toUpperCase() + currentTraversal.slice(1)}(` 
        : `${currentTraversal}(`;
    const funcStart = lines.findIndex(l => l.includes(funcNameNeedle) && (l.includes('function') || l.includes('def') || l.includes('static void')));
    
    let targetIndex = -1;
    if (type === 'visit') {
        targetIndex = lines.findIndex((l, i) => i >= funcStart && (l.includes('console.log') || l.includes('print') || l.includes('Console.WriteLine')));
    } else if (side) {
        const needle = side === 'left' ? '.left' : (side === 'right' ? '.right' : '.middle');
        const capNeedle = needle.charAt(0) + needle.charAt(1).toUpperCase() + needle.slice(2);
        targetIndex = lines.findIndex((l, i) => i >= funcStart && (l.includes(needle) || l.includes(capNeedle)));
        if (targetIndex === -1) {
            targetIndex = lines.findIndex((l, i) => i >= funcStart && (l.includes('children') || l.includes('child') || l.includes(funcNameNeedle)));
        }
    }

    if (targetIndex !== -1 && lineEls[targetIndex]) {
        lineEls[targetIndex].classList.add('highlight');
        lineEls[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function pushStack(node) {
    const frame = document.createElement('div');
    frame.className = 'stack-frame active';
    frame.dataset.nodeValue = node.value;
    frame.textContent = getStackLabel(node.value);
    
    const prevActive = els.stackDisplay.querySelector('.stack-frame.active');
    if (prevActive) prevActive.classList.remove('active');
    
    els.stackDisplay.insertBefore(frame, els.stackDisplay.firstChild);
}

function popStack() {
    const top = els.stackDisplay.querySelector('.stack-frame');
    if (top) top.remove();
    const next = els.stackDisplay.querySelector('.stack-frame');
    if (next) next.classList.add('active');
}

function getStackLabel(val) {
    const funcName = currentLang === 'csharp' 
        ? currentTraversal.charAt(0).toUpperCase() + currentTraversal.slice(1)
        : currentTraversal;
    return `${funcName}(${val})`;
}

function refreshStack() {
    const frames = els.stackDisplay.querySelectorAll('.stack-frame');
    frames.forEach(frame => {
        if (frame.dataset.nodeValue) {
            const printResult = frame.querySelector('.print-result');
            frame.textContent = getStackLabel(frame.dataset.nodeValue);
            if (printResult) frame.appendChild(printResult);
        }
    });
}

function updateVisibility() {
    const showCode = els.checkCode.checked;
    const showStack = els.checkStack.checked;
    
    els.codePanel.classList.toggle('hidden', !showCode);
    els.stackPanel.classList.toggle('hidden', !showStack);
    
    // If only one is shown, it must take full height
    if (showCode && !showStack) {
        els.codePanel.style.flex = '1';
    } else if (!showCode && showStack) {
        els.stackPanel.style.flex = '1';
    } else if (showCode && showStack) {
        if (!els.codePanel.style.flex || els.codePanel.style.flex === '1') {
            els.codePanel.style.flex = '1';
            els.stackPanel.style.flex = '1';
        }
    }

    // Hide vertical resizer if either panel is hidden
    els.resizerV.classList.toggle('hidden', !showCode || !showStack);
    
    // If both are hidden, hide the entire insights panel and horizontal resizer
    const showInsights = showCode || showStack;
    els.insights.classList.toggle('hidden', !showInsights);
    els.resizerH.classList.toggle('hidden', !showInsights);
}

function updateCode() {
    const maxChildren = parseInt(els.maxChild.value);
    // Focus mode is gone, but we still need snippets
    const code = getSnippets(currentLang, currentTraversal, tree, maxChildren, false);
    
    els.codeDisplay.innerHTML = code.split('\n')
        .map(line => `<span class="code-line">${line}</span>`)
        .join('\n');
}
