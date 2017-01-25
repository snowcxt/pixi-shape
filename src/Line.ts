import {IGraphicsShapeConfig, GraphicsShape, IPoint, Util} from "./Core";

export interface ILineConfig extends IGraphicsShapeConfig {
    points: Array<IPoint>;
    closed?: boolean;
}

export class Line extends GraphicsShape {
    public attrs: ILineConfig;

    constructor(config: ILineConfig) {
        config = Util.extend({ points: null, closed: false }, config);
        super(config);
    }

    draw() {
        super.draw();
        if (this.attrs.points && this.attrs.points.length >= 2) {
            const startPoint = this.attrs.points[0];
            this.shape.moveTo(startPoint.x, startPoint.y);
            for (let i = 1; i < this.attrs.points.length; i++) {
                const point = this.attrs.points[i];
                this.shape.lineTo(point.x, point.y);
            }
            if (this.attrs.closed)
                this.shape.lineTo(startPoint.x, startPoint.y);
        }
    }
}
