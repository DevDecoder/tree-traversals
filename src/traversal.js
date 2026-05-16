export function* preorder(node) {
    if (!node) return;
    yield { type: 'visit', node, side: 'left' };
    yield* preorder(node.left);
    yield* preorder(node.right);
}

export function* inorder(node) {
    if (!node) return;
    yield { type: 'move', node, side: 'left' };
    yield* inorder(node.left);
    yield { type: 'visit', node, side: 'bottom' };
    yield* inorder(node.right);
}

export function* postorder(node) {
    if (!node) return;
    yield { type: 'move', node, side: 'left' };
    yield* postorder(node.left);
    yield { type: 'move', node, side: 'right' };
    yield* postorder(node.right);
    yield { type: 'visit', node, side: 'right' };
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
        // Map 1-10 to 2000ms - 100ms
        this.speed = 2000 - (val * 190);
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

    async manualStep() {
        if (this.isFinished) return;
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
