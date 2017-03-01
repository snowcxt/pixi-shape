import {Shape, IShapeConfig} from "./Core";

export interface IImageConfig extends IShapeConfig {
    image: ImageTexture;
    mask?: PIXI.Graphics;
}

export class ImageTexture {
    // public onLoaded: (onTextureUpdate) => void;
    public texture: PIXI.Texture;
    private src: string;

    constructor(src) {
        this.src = src;
        this.texture = PIXI.Texture.fromImage(src);
    }
}

export class Image extends Shape {
    shape: PIXI.Sprite;
    public attrs: IImageConfig;
    public onLoaded: (onTextureUpdate) => void;

    constructor(config: IImageConfig) {
        super(new PIXI.Sprite(config.image.texture), config);
    }

    draw() {
        super.draw();
        if (this.attrs.mask) {
            this.shape.mask = this.attrs.mask;
        }
    }
}
