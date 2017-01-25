import {Shape, IShapeConfig} from "./Core";

export interface IImageConfig extends IShapeConfig {
    image: ImageTexture;
}

export class ImageTexture {
    // public onLoaded: (onTextureUpdate) => void;
    public texture: PIXI.Texture;
    private src: string;

    constructor(src) {
        this.src = src;
        this.texture = PIXI.Texture.fromImage(src);
        // this.onLoaded = (onTextureUpdate: (image: ImageTexture) => void) => {
        //    this.texture.addEventListener("update", () => { onTextureUpdate(this); });
        // };
    }

    // public load(onloaded: (texture: ImageTexture) => void= () => { }) {
    //    this.texture = PIXI.Texture.fromImage(this.src);
    //    this.texture.addEventListener("update", () => { alert(" onloaded(this)"); });
    //    onloaded(this);
    // }


    static loadAll(images, loaded: () => void = () => { }) {
        //var imageLoader = new PIXI.ImageLoader("http://www.goodboydigital.com/pixijs/logo_small.png", true);
        //imageLoader.addEventListener("loaded", onComplete);
        //imageLoader.load();
        //renderer.render(stage);


        //function onComplete(e) {
        //    console.log("event data: ", e);
        //    var bunny = new PIXI.Sprite(e.content.texture);

        //    bunny.position = new PIXI.Point(200, 150);
        //    stage.addChild(bunny);

        //    renderer.render(stage);
        //}

        //if (images) {
        //    var count = 0;
        //    if (typeof (images) == 'object') {
        //        for (var key in images) {
        //            count++;
        //            var image: ImageTexture = images[key];
        //            image.onLoaded(() => {
        //                count--;
        //                if (count == 0) {
        //                    loaded();
        //                }
        //            });
        //        }
        //    } else if (images instanceof Array) {
        //        count = (<Array<Pixis.ImageTexture>>images).length;
        //        (<Array<Pixis.ImageTexture>>images).forEach((img) => {
        //            img.onLoaded(() => {
        //                count--;
        //                if (count == 0) {
        //                    loaded();
        //                }
        //            });
        //        });
        //    }
        // } else {
        //    loaded();
        // }
    }
}

export class Image extends Shape {
    // private   texture=null;
    public onLoaded: (onTextureUpdate) => void;

    constructor(config: IImageConfig) {
        super(new PIXI.Sprite(config.image.texture), config);
    }
}
