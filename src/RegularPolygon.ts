import {IGraphicsShapeConfig, GraphicsShape, Util} from "./Core";

export interface IRegularPolygonConfig extends IGraphicsShapeConfig {
    sides: number;
    radius: number;
}

export class RegularPolygon extends GraphicsShape {
    public attrs: IRegularPolygonConfig;

    constructor(config: IRegularPolygonConfig) {
        config = Util.extend({ sides: 3, radius: 100 }, config);
        super(config);
    }

    draw() {
        let sides = this.attrs.sides,
            radius = this.attrs.radius,
            n,
            x,
            y;

        if (sides >= 3) {
            super.draw();

            this.shape.moveTo(0, 0 - radius);

            for (n = 1; n < sides; n++) {
                x = radius * Math.sin(n * 2 * Math.PI / sides);
                y = -1 * radius * Math.cos(n * 2 * Math.PI / sides);
                this.shape.lineTo(x, y);
            }

            this.shape.lineTo(0, 0 - radius);
        }
    }
}
