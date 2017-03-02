/// <reference path="./pixi.d.ts" />
import {Animation, Tween} from "./Animation";

export interface IPoint {
    x: number;
    y: number;
}

export interface IShapeConfig {
    x?: number;
    y?: number;
    pivotX?: number;
    pivotY?: number;
    scaleX?: number;
    scaleY?: number;
    opacity?: number;

    filters?: any[];
    blur?: number;

    rotation?: number;
    visible?: boolean;
}

export interface IGraphicsShapeConfig extends IShapeConfig {
    fill?: number;

    stroke?: number;
    strokeWidth?: number;
    strokeOpacity?: number;

    hitArea?: {
        type: number;
        padding?: number;
    };
}

export interface IContainer {
    add: (shape: Shape) => void;
    getStage: () => Stage;
    remove: (shape: Shape) => void;
}

export const HitAreaType = {
    None: 0,
    Box: 1,
    Fit: 2
};

const AnimStatuses = {
    stopped: 0,
    running: 1
};

export class Stage implements IContainer {
    public stage: PIXI.Container;
    private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
    private animations: Array<Animation> = [];

    constructor(width: number, height: number, canvas?: HTMLCanvasElement, opts?: { webgl?: boolean }) {
        opts = Util.extend({ webgl: true }, opts);

        this.stage = new PIXI.Container();

        if (opts.webgl) {
            this.renderer = PIXI.autoDetectRenderer(width, height, {
                view: canvas,
                transparent: true,
                antialias: true
            });
        } else {
            this.renderer = new PIXI.CanvasRenderer(width, height, {
                view: canvas,
                transparent: true
            });
        }

        if (!canvas) {
            document.body.appendChild(this.renderer.view);
        }
    }

    public add(shape: Shape): void {
        shape.parent = this;
        this.stage.addChild(shape.shape);
    }

    public remove(shape: Shape): void {
        this.stage.removeChild(shape.shape);
        shape.parent = null;
    }

    public addChild(object: PIXI.DisplayObject) {
        this.stage.addChild(object);
    }

    public getStage() {
        return this;
    }

    public draw(): void {
        this.renderer.render(this.stage);
    }

    animStatus = AnimStatuses.stopped;

    private lastLoop;

    runAnimation = () => {
        const thisLoop = new Date;
        const timeSpan = (<any>thisLoop - this.lastLoop) / 1000;

        this.lastLoop = thisLoop;
        if (this.animStatus === AnimStatuses.running) {
            let i = 0, l = this.animations.length, anim: Animation;
            while (i < l) {
                anim = this.animations[i];
                if (!anim.stopped) {
                    if (anim.animate(timeSpan, anim.tag)) {
                        i++;
                    } else {
                        anim.stopped = true;
                        if (anim.finish) {
                            anim.finish(anim);
                        }
                        this.animations.splice(i, 1);
                        l--;
                    }
                } else {
                    if (anim.finish) {
                        anim.finish(anim);
                    }
                    this.animations.splice(i, 1);
                    l--;
                }
            }

            this.draw();

            if (this.animations.length > 0) {
                // requestAnimFrame(this.runAnimation);
                window.requestAnimationFrame(this.runAnimation);
            } else {
                this.animStatus = AnimStatuses.stopped;
            }
        }
    }

    public addAnimation(anim: Animation) {
        this.animations.push(anim);
        if (this.animStatus === AnimStatuses.stopped) {
            this.animStatus = AnimStatuses.running;
            this.lastLoop = new Date;
            this.runAnimation();
        }
    }

    public startAnim(animateFunc: (animation: Animation) => void) {
        this.addAnimation(new Animation((animation) => {
            animateFunc(animation);
            return true;
        }, null));
    }

    public stopAnimations() {
        this.animations = [];
        this.animStatus = AnimStatuses.stopped;
    }
}

export class Shape {
    public attrs: IShapeConfig;
    public shape: PIXI.DisplayObject;
    public parent: IContainer = null;

    constructor(shape, config: IGraphicsShapeConfig) {
        this.shape = shape;
        config = Util.extend({
            x: 0, y: 0,
            pivotX: 0, pivotY: 0,
            scaleX: 1, scaleY: 1,
            rotation: 0,
            visible: true,
            fill: null,
            opacity: 1,
            strokeWidth: 1,
            strokeOpacity: 1,
            filters: [],
            blur: 0
        }, config);

        this.attrs = config;
        this.draw();
    }

    public getAttr(attr: string) {
        return this.attrs[attr];
    }

    public setAttrs(config: IGraphicsShapeConfig): void {
        this.attrs = Util.extend(this.attrs, config);
        this.draw();
    }

    draw() {
        this.shape.visible = this.attrs.visible;

        this.shape.position.x = this.attrs.x;
        this.shape.position.y = this.attrs.y;

        this.shape.alpha = this.attrs.opacity;

        this.shape.rotation = this.attrs.rotation;

        this.shape.scale = new PIXI.Point(this.attrs.scaleX, this.attrs.scaleY);

        this.shape.pivot = new PIXI.Point(this.attrs.pivotX, this.attrs.pivotY);

        if (!this.attrs.filters) {
            this.attrs.filters = [];
        }
        if (this.attrs.blur > 0) {
            const blur = new PIXI.filters.BlurFilter();
            blur.blur = this.attrs.blur;
            this.attrs.filters.push(blur);
        }

        // var pixelateFilter = new PIXI.PixelateFilter();
        // var grayFilter = new PIXI.GrayFilter();
        // var twistFilter = new PIXI.TwistFilter();
        // var dotScreenFilter = new (<any> PIXI).DotScreenFilter();
        // var colorStepFilter = new PIXI.ColorStepFilter();
        // var crossHatchFilter = new PIXI.CrossHatchFilter();
        // var rgbSplitterFilter = new PIXI.RGBSplitFilter();

        if (this.attrs.filters.length > 0) {
            this.shape.filters = this.attrs.filters;
        } else {
            this.shape.filters = null;
        }
    }

    public show() {
        this.attrs.visible = true;
        this.shape.visible = true;
    }

    public hide() {
        this.attrs.visible = false;
        this.shape.visible = false;
    }

    public setPostion(x: number, y: number) {
        this.attrs.x = x;
        this.attrs.y = y;

        this.shape.position.x = this.attrs.x;
        this.shape.position.y = this.attrs.y;
    }

    public move(offsetX: number, offsetY: number) {
        this.setPostion(this.attrs.x + offsetX, this.attrs.y + offsetY);
    }

    public setRotation(angle: number) {
        this.attrs.rotation = angle;
        this.shape.rotation = angle;
    }

    public rotate(offsetAngle: number) {
        this.setRotation(this.attrs.rotation + offsetAngle);
    }

    public scale(x: number, y: number) {
        this.attrs.scaleX = x;
        this.attrs.scaleY = y;

        this.shape.scale = new PIXI.Point(x, y);
    }

    public setPivot(x: number, y: number) {
        this.attrs.pivotX = x;
        this.attrs.pivotY = y;

        this.shape.pivot = new PIXI.Point(x, y);
    }

    public tween(duration: number, to: any, easing?: (t: number, b: number, c: number, d: number) => number): Tween {
        return new Tween({
            shape: this,
            duration: duration,
            to: to
        }, easing);
    }
}

export class GraphicsShape extends Shape {
    public className: string;
    public shape: PIXI.Graphics;
    public attrs: IGraphicsShapeConfig;

    constructor(config) {
        config = Util.extend({
            fill: null,
            strokeWidth: 1,
            strokeOpacity: 1,
            hitArea: null
        }, config);

        super(new PIXI.Graphics(), config);

        if (this.attrs.hitArea && this.attrs.hitArea.type !== HitAreaType.None) {
            this.shape.interactive = true;
            switch (this.attrs.hitArea.type) {
                case HitAreaType.Box:
                    this.shape.hitArea = this.calHitAreaBox();
                    break;
            }
        }
    }

    calHitAreaBox(): PIXI.Rectangle {
        const box = this.shape.getLocalBounds();
        const padding = this.attrs.hitArea.padding || 0;

        const paddingX = padding / this.attrs.scaleX;
        const paddingY = padding / this.attrs.scaleY;

        // var width = this.attrs.scale ? box.width / this.attrs.scale.x : box.width;
        // var height = this.attrs.scale ? box.height / this.attrs.scale.y : box.height;
        let width = box.width;
        let height = box.height;

        if (this.attrs.hitArea.padding) {
            width += paddingX / 2;
            height += paddingY / 2;
        }

        return new PIXI.Rectangle(-width / 2, -height / 2, width, height);
    }

    draw() {
        if (this.attrs.stroke) {
            this.shape.lineStyle(this.attrs.strokeWidth, this.attrs.stroke, this.attrs.strokeOpacity);
        }

        if (this.attrs.fill != null) {
            this.shape.beginFill(this.attrs.fill, this.attrs.opacity);
        }

        super.draw();
    }

    public setAttrs(config: any): void {
        this.attrs = Util.extend(this.attrs, config);
        this.shape.clear();
        this.draw();
    }

    public clear() {
        this.shape.clear();
        if (this.parent) {
            this.parent.remove(this);
        }
    }
}

export namespace Util {
    export function extend(destination, source): any {
        if (source) {
            for (const property in source)
                if (typeof (source[property]) !== "undefined")
                    destination[property] = source[property];
        }
        return destination;
    }

    export function getColorInt(str: string): number {
        return parseInt(str.substring(1), 16);
    }

    export function getRgb(color: number) {
        const rgb = { r: 0, g: 0, b: 0 };

        rgb.b = color % 0x100;
        color = Math.floor(color / 0x100);

        rgb.g = color % 0x100;
        color = Math.floor(color / 0x100);

        rgb.r = color % 0x100;

        return rgb;
    }

    export function getColor(r: number, g: number, b: number) {
        return Math.round(r) * 0x10000 + Math.round(g) * 0x100 + Math.round(b);
    }

    export function getColorString(num: number): string {
        return num != null ? "#" + num.toString(16) : null;
    }
}
