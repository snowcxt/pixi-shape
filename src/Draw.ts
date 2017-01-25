import {Shape, IShapeConfig} from "./Core";

export interface IDrawConfig extends IShapeConfig {
    width: number;
    height: number;
    draw: (ctx: CanvasRenderingContext2D) => void;
}

export class Draw extends Shape {
    public shape: PIXI.Sprite;
    public attrs: IDrawConfig;

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    constructor(config: IDrawConfig) {
        config.draw = config.draw || (() => { });
        let canvas = document.createElement("canvas");
        canvas.width = config.width;
        canvas.height = config.height;

        super(new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas)), config);

        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.draw();
    }

    draw() {
        if (this.canvas) {
            super.draw();
            this.ctx.beginPath();
            this.attrs.draw(this.ctx);
        }
    }

    public redraw(draw: (ctx: CanvasRenderingContext2D) => void) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.attrs.draw = draw;
        this.draw();
        this.shape.texture.baseTexture.emit("update", this.shape.texture.baseTexture);
    }

    public clean() {
        this.shape.texture.destroy(false);
    }
}
