import {IGraphicsShapeConfig, GraphicsShape, Util} from "./Core";

export interface IArcConfig extends IGraphicsShapeConfig {
    innerRadius: number;
    outerRadius: number;
    angle: number;
    clockwise?: boolean;
}

export class Arc extends GraphicsShape {
    public attrs: IArcConfig;

    constructor(config: IArcConfig) {
        config = Util.extend({ clockwise: false }, config);
        super(config);
    }

    draw() {
        super.draw();
        this.shape.moveTo(this.attrs.innerRadius, 0);
        this.shape.lineTo(this.attrs.outerRadius, 0);
        this.shape.arc(0, 0, this.attrs.outerRadius, 0, this.attrs.angle, this.attrs.clockwise);

        this.shape.lineTo(this.attrs.innerRadius * Math.cos(this.attrs.angle), this.attrs.innerRadius * Math.sin(this.attrs.angle));

        this.shape.arc(0, 0, this.attrs.innerRadius, this.attrs.angle, 0, !this.attrs.clockwise);
        this.shape.lineTo(this.attrs.innerRadius, 0);
    }
}
