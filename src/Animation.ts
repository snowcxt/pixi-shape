import {Util, Shape} from "./Core";

export interface ITweenCallback {
    done?: () => void;
    progress?: (animation: Animation) => void;
}

export class Animation {
    public tag: any;
    public animate: (timespan: number, tag: any) => void;
    public finish: (animation: Animation) => void;
    public stopped = false;
    public isToward: boolean;
    public elapse: number = 0;
    public total: number;

    constructor(animate: (animation: Animation) => boolean, length: number, opts?: {
        finish?: (animation: Animation) => void;
        tag?: any;
        isToward?: boolean;
    }) {
        opts = Util.extend({
            isToward: true,
            finished: () => { }
        }, opts || {});

        this.tag = opts.tag;
        this.isToward = opts.isToward;
        this.total = length ? length : null;
        if (!this.isToward) {
            this.elapse = this.total;
        }

        this.animate = (timespan: number) => {
            const isTerminated = this.isTerminated(timespan),
                result = animate(this);

            return !isTerminated && result;
        };
        this.finish = opts.finish;
    }

    private isTerminated(span: number) {
        if (this.isToward) {
            this.elapse += span;
        } else {
            this.elapse -= span;
        }

        if (this.total !== null) {
            if (this.isToward) {
                if (this.elapse >= this.total) {
                    this.elapse = this.total;
                    return true;
                }
            } else {
                if (this.elapse <= 0) {
                    this.elapse = 0;
                    return true;
                }
            }
        }

        return false;
    }
}

export interface ITweenConfig {
    shape: Shape;
    duration: number;
    to: any;
}

export class Tween {
    private shape: Shape;
    private easing: (t: number, b: number, c: number, d: number) => number;
    private duration: number;
    private init;
    private to: any = null;
    private begin = {};
    private change = {};
    private attrs = {};
    private animation: Animation = null;
    private toward = true;
    private progress: (animation: Animation) => void;

    constructor(config: ITweenConfig, easing?: (t: number, b: number, c: number, d: number, a?: number, p?: number) => number) {
        this.shape = config.shape;
        this.easing = easing || Easings.Linear;
        this.duration = config.duration;
        this.init = Util.extend({}, this.shape.attrs);
        this.setTo(config.to);

        this.animation = new Animation(() => {
            this.setAttrs();
            this.progress(this.animation);

            return true;
        }, this.duration, { isToward: this.toward });
        this.animation.stopped = true;
    }

    public setTo(to) {
        if (this.to) {
            this.to = Util.extend(this.to, to);
        } else {
            this.to = to;
        }
        let property, value;
        for (property in this.to) {
            value = this.init[property];
            if (value !== undefined) {
                switch (property) {
                    case "fill":
                    case "stroke":
                        this.begin[property] = Util.getRgb(value);
                        const to = Util.getRgb(this.to[property]);
                        this.change[property] = {
                            r: to.r - this.begin[property].r,
                            g: to.g - this.begin[property].g,
                            b: to.b - this.begin[property].b
                        };
                        break;
                    default:
                        this.begin[property] = value;
                        this.change[property] = this.to[property] - value;
                }
            }
        }
    }

    private setAttrs() {
        for (let p in this.change) {
            switch (p) {
                case "fill":
                case "stroke":
                    const r = this.easing(this.animation.elapse, this.begin[p].r, this.change[p].r, this.animation.total);
                    const g = this.easing(this.animation.elapse, this.begin[p].g, this.change[p].g, this.animation.total);
                    const b = this.easing(this.animation.elapse, this.begin[p].b, this.change[p].b, this.animation.total);
                    this.attrs[p] = Util.getColor(r, g, b);
                    break;
                default:
                    this.attrs[p] = this.easing(this.animation.elapse, this.begin[p], this.change[p], this.animation.total);
                    break;
            }
        }

        this.shape.setAttrs(this.attrs);
    }

    private animate(callback?: ITweenCallback) {
        callback = callback || {};
        this.progress = callback.progress || (() => { });
        this.animation.isToward = this.toward;
        this.animation.finish = callback.done || (() => { });
        return this.resume();
    }

    public play(callback?: ITweenCallback): Tween {
        this.toward = true;
        return this.animate(callback);
    }

    public reverse(callback?: ITweenCallback) {
        this.toward = false;
        return this.animate(callback);
    }

    public seek(postion: number) {
        this.animation.elapse = postion;
        this.setAttrs();
    }

    public pause() {
        if (this.animation) {
            this.animation.stopped = true;
        }
        return this;
    }

    public resume() {
        let parent = this.shape.parent,
            stage;

        if (parent) {
            stage = parent.getStage();

            if (stage && this.animation && this.animation.stopped) {
                this.animation.stopped = false;
                stage.addAnimation(this.animation);
            }
        }

        return this;
    }
}

export const Easings = {
    /**
    * back ease in
    * @function
    * @memberof Kinetic.Easings
    */
    BackEaseIn: (t, b, c, d) => {
        const s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    /**
    * back ease out
    * @function
    * @memberof Kinetic.Easings
    */
    BackEaseOut: (t, b, c, d) => {
        const s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    /**
    * back ease in out
    * @function
    * @memberof Kinetic.Easings
    */
    BackEaseInOut: (t, b, c, d) => {
        let s = 1.70158;
        if ((t /= d / 2) < 1) {
            return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        }
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    },
    /**
    * elastic ease in
    * @function
    * @memberof Kinetic.Easings
    */
    ElasticEaseIn: (t, b, c, d, a, p) => {
        // added s = 0
        let s = 0;
        if (t === 0) {
            return b;
        }
        if ((t /= d) === 1) {
            return b + c;
        }
        if (!p) {
            p = d * 0.3;
        }
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        }
        else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    },
    /**
    * elastic ease out
    * @function
    * @memberof Kinetic.Easings
    */
    ElasticEaseOut: (t, b, c, d, a, p) => {
        // added s = 0
        let s = 0;
        if (t === 0) {
            return b;
        }
        if ((t /= d) === 1) {
            return b + c;
        }
        if (!p) {
            p = d * 0.3;
        }
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        }
        else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
    },
    /**
    * elastic ease in out
    * @function
    * @memberof Kinetic.Easings
    */
    ElasticEaseInOut: (t, b, c, d, a, p) => {
        // added s = 0
        let s = 0;
        if (t === 0) {
            return b;
        }
        if ((t /= d / 2) === 2) {
            return b + c;
        }
        if (!p) {
            p = d * (0.3 * 1.5);
        }
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        }
        else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        if (t < 1) {
            return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        }
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
    },
    /**
    * bounce ease out
    * @function
    * @memberof Kinetic.Easings
    */
    BounceEaseOut: (t, b, c, d) => {
        if ((t /= d) < (1 / 2.75)) {
            return c * (7.5625 * t * t) + b;
        }
        else if (t < (2 / 2.75)) {
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
        }
        else if (t < (2.5 / 2.75)) {
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
        }
        else {
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
        }
    },
    /**
    * bounce ease in
    * @function
    * @memberof Kinetic.Easings
    */
    BounceEaseIn: (t, b, c, d) => {
        return c - Easings.BounceEaseOut(d - t, 0, c, d) + b;
    },
    /**
    * bounce ease in out
    * @function
    * @memberof Kinetic.Easings
    */
    BounceEaseInOut: (t, b, c, d) => {
        if (t < d / 2) {
            return Easings.BounceEaseIn(t * 2, 0, c, d) * 0.5 + b;
        }
        else {
            return Easings.BounceEaseOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
        }
    },
    /**
    * ease in
    * @function
    * @memberof Kinetic.Easings
    */
    EaseIn: (t, b, c, d) => {
        return c * (t /= d) * t + b;
    },
    /**
    * ease out
    * @function
    * @memberof Kinetic.Easings
    */
    EaseOut: (t, b, c, d) => {
        return -c * (t /= d) * (t - 2) + b;
    },
    /**
    * ease in out
    * @function
    * @memberof Kinetic.Easings
    */
    EaseInOut: (t, b, c, d) => {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t + b;
        }
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    },
    /**
    * strong ease in
    * @function
    * @memberof Kinetic.Easings
    */
    StrongEaseIn: (t, b, c, d) => {
        return c * (t /= d) * t * t * t * t + b;
    },
    /**
    * strong ease out
    * @function
    * @memberof Kinetic.Easings
    */
    StrongEaseOut: (t, b, c, d) => {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    /**
    * strong ease in out
    * @function
    * @memberof Kinetic.Easings
    */
    StrongEaseInOut: (t, b, c, d) => {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t * t * t * t + b;
        }
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },
    /**
    * linear
    * @function
    * @memberof Kinetic.Easings
    */
    Linear: (t, b, c, d) => {
        return c * t / d + b;
    }
};
