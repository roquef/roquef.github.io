class Control {
    constructor(persons) {
        this.persons = persons;
        this.options = this.default_options;
        this.draw = this.draw.bind(this);
    }

    get default_options() { return { threshold: 50 } }

    draw(ctx, canvas) {
        setTimeout(() => {
            for (let p of this.persons) {
                for (let p2 of this.persons) {
                    if (p.id !== p2.id) {
                        if (this.near(p, p2)) {
                            p2.direction = { x: 4 - ((1 * Math.random()) * 8), y: 4 - ((1 * Math.random()) * 8) }
                        }
                    }
                }
            }
    
            // this.options.threshold += Math.sin(this.time);;
        }, 0)
    }

    near(p1, p2) {
        if (p1.center.x < p2.center.x + p2.options.radius + this.options.threshold / 2 &&
            p1.center.x + p1.options.radius + this.options.threshold / 2 > p2.center.x &&
            p1.center.y < p2.center.y + p2.options.radius + this.options.threshold / 2 &&
            p1.center.y + p1.options.radius + this.options.threshold / 2 > p2.center.y) {
            return true;
        }
    }

    set position({ x, y }) {
        this.options.x = x;
        this.options.y = y;
    }

    get() {
        return this;
    }
}

export default Control;