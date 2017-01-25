import {GraphicsShape, IGraphicsShapeConfig} from "./Core";

export interface IStarConfig extends IGraphicsShapeConfig {
    innerRadius: number;
    outerRadius: number;
    numPoints: number;
}

export class Star extends GraphicsShape {
    public attrs: IStarConfig;

    constructor(config: IStarConfig) {
        super(config);
    }

    draw() {
        super.draw();

        const innerRadius = this.attrs.innerRadius,
            outerRadius = this.attrs.outerRadius,
            numPoints = this.attrs.numPoints;
        this.shape.moveTo(0, 0 - outerRadius);

        for (let n = 1; n < numPoints * 2; n++) {
            const radius = n % 2 === 0 ? outerRadius : innerRadius;
            const x = radius * Math.sin(n * Math.PI / numPoints);
            const y = -1 * radius * Math.cos(n * Math.PI / numPoints);
            this.shape.lineTo(x, y);
        }

        this.shape.lineTo(0, 0 - outerRadius);
    }
}
