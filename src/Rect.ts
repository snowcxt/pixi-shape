import {IGraphicsShapeConfig, GraphicsShape, Util} from "./Core";

export interface IRectConfig extends IGraphicsShapeConfig {
    width: number;
    height: number;
    cornerRadius?: number;
}

export class Rect extends GraphicsShape {
    public attrs: IRectConfig;

    constructor(config: IRectConfig) {
        config = Util.extend({ width: 100, height: 100, cornerRadius: 0 }, config);
        super(config);
    }

    draw() {
        super.draw();

        const cornerRadius = this.attrs.cornerRadius, width = this.attrs.width, height = this.attrs.height;

        if (!cornerRadius || cornerRadius <= 0) {
            this.shape.drawRect(0, 0, width, height);
        } else {
            this.shape.moveTo(cornerRadius, 0);
            this.shape.lineTo(width - cornerRadius, 0);
            this.shape.arc(width - cornerRadius, cornerRadius, cornerRadius, Math.PI * 3 / 2, 0, false);
            this.shape.lineTo(width, height - cornerRadius);
            this.shape.arc(width - cornerRadius, height - cornerRadius, cornerRadius, 0, Math.PI / 2, false);
            this.shape.lineTo(cornerRadius, height);
            this.shape.arc(cornerRadius, height - cornerRadius, cornerRadius, Math.PI / 2, Math.PI, false);
            this.shape.lineTo(0, cornerRadius);
            this.shape.arc(cornerRadius, cornerRadius, cornerRadius, Math.PI, Math.PI * 3 / 2, false);

            // this.shape.lineTo(cornerRadius, 0);
            // this.shape.drawRoundedRect(0, 0, width, height, cornerRadius);

        }
    }

    calHitAreaBox() {
        return new PIXI.Rectangle(0, 0, this.attrs.width, this.attrs.height);
    }
}
