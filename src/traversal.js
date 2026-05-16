export function* preorder(node) {
    if (!node) return;
    yield { type: 'enter', node };
    yield { type: 'visit', node };
    for (let i = 0; i < node.children.length; i++) {
        yield { type: 'move', node, side: i === 0 ? 'left' : (i === node.children.length - 1 ? 'right' : 'middle') };
        yield* preorder(node.children[i]);
    }
    yield { type: 'exit', node };
}

export function* inorder(node) {
    if (!node) return;
    yield { type: 'enter', node };
    if (node.children.length > 0) {
        yield { type: 'move', node, side: 'left' };
        yield* inorder(node.children[0]);
    }
    yield { type: 'visit', node };
    for (let i = 1; i < node.children.length; i++) {
        yield { type: 'move', node, side: i === node.children.length - 1 ? 'right' : 'middle' };
        yield* inorder(node.children[i]);
    }
    yield { type: 'exit', node };
}

export function* postorder(node) {
    if (!node) return;
    yield { type: 'enter', node };
    for (let i = 0; i < node.children.length; i++) {
        yield { type: 'move', node, side: i === 0 ? 'left' : (i === node.children.length - 1 ? 'right' : 'middle') };
        yield* postorder(node.children[i]);
    }
    yield { type: 'visit', node };
    yield { type: 'exit', node };
}

export class Animator {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.generator = null;
        this.timer = null;
        this.speed = 500;
        this.isPlaying = false;
        this.isFinished = false;
    }

    start(generator) {
        this.generator = generator;
        this.isFinished = false;
        this.isPlaying = true;
        this.step();
    }

    pause() {
        this.isPlaying = false;
        clearTimeout(this.timer);
    }

    resume() {
        if (this.isFinished) return;
        this.isPlaying = true;
        this.step();
    }

    setSpeed(val) {
        // Map 1-20 to 2000ms - 1ms
        // Higher values are faster (shorter delays)
        if (val >= 20) {
            this.speed = 1;
        } else {
            this.speed = Math.max(1, 2000 * Math.pow(0.65, val - 1));
        }
    }

    async step() {
        if (!this.isPlaying) return;

        const { value, done } = this.generator.next();
        if (done) {
            this.isFinished = true;
            this.isPlaying = false;
            if (this.callbacks.onComplete) this.callbacks.onComplete();
            return;
        }

        if (this.callbacks.onStep) {
            await this.callbacks.onStep(value);
        }

        this.timer = setTimeout(() => this.step(), this.speed);
    }

    async manualStep(generator) {
        if (generator) this.generator = generator;
        if (!this.generator || this.isFinished) return;
        
        const { value, done } = this.generator.next();
        if (done) {
            this.isFinished = true;
            if (this.callbacks.onComplete) this.callbacks.onComplete();
            return;
        }
        if (this.callbacks.onStep) {
            await this.callbacks.onStep(value);
        }
    }
}
