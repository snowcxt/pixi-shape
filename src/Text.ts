import {IGraphicsShapeConfig, Shape, Util} from "./Core";

export const TextAlign = {
    Left: "left",
    Center: "center",
    Right: "right"
};

export interface ITextConfig extends IGraphicsShapeConfig {
    text: string;
    fontFamily: string;
    fontSize: number | string;
    align?: string;
    width?: number;
    height?: number;
    lineHeight?: number;
    padding?: number;
}

export class Text extends Shape {
    public shape: PIXI.Text;
    public attrs: ITextConfig;

    constructor(config: ITextConfig) {
        const text = new PIXI.Text(config.text, Text.getTextStyleOptions(config));
        text.width = config.width;
        text.height = config.height;

        super(text, config);
    }

    private static getTextStyleOptions(config: ITextConfig): PIXI.TextStyleOptions {
      return {
          fontFamily: config.fontFamily,
          fontSize: config.fontSize,
          align: config.align,
          fill: Util.getColorString(config.fill),
          stroke: Util.getColorString(config.stroke),
          strokeThickness: config.strokeWidth,
          lineHeight: config.lineHeight
      };
    }

    draw() {
        this.shape.width = this.attrs.width;
        this.shape.height = this.attrs.height;
        this.shape.text = this.attrs.text;
        (<any>this.shape).style = Text.getTextStyleOptions(this.attrs);

        super.draw();
    }

    public setAttrs(config) {
        this.attrs = Util.extend(this.attrs, config);
        this.draw();
    }

    public setText(text: string) {
        this.attrs.text = text;
        this.shape.text = text;
    }
}
