import {IGraphicsShapeConfig, GraphicsShape, Util} from "./Core";

export interface ICircleConfig extends IGraphicsShapeConfig {
    radius: number;
}

export class Circle extends GraphicsShape {
    public attrs: ICircleConfig;

    constructor(config: ICircleConfig) {
        config = Util.extend({ radius: 100 }, config);
        super(config);
    }

    draw() {
        super.draw();
        this.shape.drawCircle(0, 0, this.attrs.radius);
    }
}
