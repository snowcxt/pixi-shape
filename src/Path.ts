import {IGraphicsShapeConfig, GraphicsShape, Util} from "./Core";

export interface IPathConfig extends IGraphicsShapeConfig {
    data: string;
}

export interface IPathData {
    command: string;
    points: Array<number>;
    start: {
        x: number;
        y: number;
    };
    pathLength: number;
}

export class Path extends GraphicsShape {
    public attrs: IPathConfig;
    constructor(config) {
        config = Util.extend({ data: "" }, config);
        super(config);
    }

    draw() {
        super.draw();

        let closedPath = false;
        const ca = parsePathData(this.attrs.data);
        let start = null;
        for (let n = 0; n < ca.length; n++) {
            if (start == null)
                start = ca[n];

            const c = ca[n].command;
            const p = ca[n].points;
            switch (c) {
                case "L":
                    this.shape.lineTo(p[0], p[1]);
                    break;
                case "M":
                    this.shape.moveTo(p[0], p[1]);
                    break;
                case "C":
                    this.shape.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]);
                    break;
                case "Q":
                    this.shape.quadraticCurveTo(p[0], p[1], p[2], p[3]);
                    break;
                case "A":
                    const cx = p[0], cy = p[1], rx = p[2], ry = p[3], theta = p[4], dTheta = p[5], psi = p[6], fs = p[7];

                    const r = (rx > ry) ? rx : ry;
                    const scaleX = (rx > ry) ? 1 : rx / ry;
                    const scaleY = (rx > ry) ? ry / rx : 1;

                    // this.move(cx, cy);
                    this.rotate(psi);
                    this.shape.scale = new PIXI.Point(scaleX, scaleY);
                    this.shape.arc(cx, cy, r, theta, theta + dTheta, 1 - fs > 0);
                    this.shape.scale = new PIXI.Point(1 / scaleX, 1 / scaleY);
                    this.rotate(-psi);
                    // this.move(-cx, -cy);

                    break;
                case "z":
                    (<any>this.shape).closePath();
                    // this.shape.lineTo(start.points[0], start.points[1]);
                    start = null;
                    closedPath = true;
                    break;
            }
        }

        // if (closedPath) {
        //    context.fillStrokeShape(this);
        // }
        // else {
        //    context.strokeShape(this);
        // }
    }
}

//#region
function convertEndpointToCenterParameterization(x1, y1, x2, y2, fa, fs, rx, ry, psiDeg): Array<number> {
    // Derived from: http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
    const psi = psiDeg * (Math.PI / 180.0);
    const xp = Math.cos(psi) * (x1 - x2) / 2.0 + Math.sin(psi) * (y1 - y2) / 2.0;
    const yp = -1 * Math.sin(psi) * (x1 - x2) / 2.0 + Math.cos(psi) * (y1 - y2) / 2.0;

    const lambda = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);

    if (lambda > 1) {
        rx *= Math.sqrt(lambda);
        ry *= Math.sqrt(lambda);
    }

    let f = Math.sqrt((((rx * rx) * (ry * ry)) - ((rx * rx) * (yp * yp)) - ((ry * ry) * (xp * xp))) / ((rx * rx) * (yp * yp) + (ry * ry) * (xp * xp)));

    if (fa === fs) {
        f *= -1;
    }
    if (isNaN(f)) {
        f = 0;
    }

    let cxp = f * rx * yp / ry;
    let cyp = f * -ry * xp / rx;

    let cx = (x1 + x2) / 2.0 + Math.cos(psi) * cxp - Math.sin(psi) * cyp;
    let cy = (y1 + y2) / 2.0 + Math.sin(psi) * cxp + Math.cos(psi) * cyp;

    let vMag = (v) => {
        return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    };
    let vRatio = (u, v) => {
        return (u[0] * v[0] + u[1] * v[1]) / (vMag(u) * vMag(v));
    };
    let vAngle = (u, v) => {
        return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(vRatio(u, v));
    };
    let theta = vAngle([1, 0], [(xp - cxp) / rx, (yp - cyp) / ry]);
    let u = [(xp - cxp) / rx, (yp - cyp) / ry];
    let v = [(-1 * xp - cxp) / rx, (-1 * yp - cyp) / ry];
    let dTheta = vAngle(u, v);

    if (vRatio(u, v) <= -1) {
        dTheta = Math.PI;
    }
    if (vRatio(u, v) >= 1) {
        dTheta = 0;
    }
    if (fs === 0 && dTheta > 0) {
        dTheta = dTheta - 2 * Math.PI;
    }
    if (fs === 1 && dTheta < 0) {
        dTheta = dTheta + 2 * Math.PI;
    }
    return [cx, cy, rx, ry, theta, dTheta, psi, fs];
}

function getLineLength(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

function getPointOnEllipticalArc(cx, cy, rx, ry, theta, psi) {
    const cosPsi = Math.cos(psi), sinPsi = Math.sin(psi);
    const pt = {
        x: rx * Math.cos(theta),
        y: ry * Math.sin(theta)
    };
    return {
        x: cx + (pt.x * cosPsi - pt.y * sinPsi),
        y: cy + (pt.x * sinPsi + pt.y * cosPsi)
    };
}

function getPointOnCubicBezier(pct, P1x, P1y, P2x, P2y, P3x, P3y, P4x, P4y) {
    const CB1 = (t) => {
        return t * t * t;
    };
    const CB2 = (t) => {
        return 3 * t * t * (1 - t);
    };
    const CB3 = (t) => {
        return 3 * t * (1 - t) * (1 - t);
    };
    const CB4 = (t) => {
        return (1 - t) * (1 - t) * (1 - t);
    };
    const x = P4x * CB1(pct) + P3x * CB2(pct) + P2x * CB3(pct) + P1x * CB4(pct);
    const y = P4y * CB1(pct) + P3y * CB2(pct) + P2y * CB3(pct) + P1y * CB4(pct);

    return {
        x: x,
        y: y
    };
}

function getPointOnQuadraticBezier(pct, P1x, P1y, P2x, P2y, P3x, P3y) {
    const QB1 = (t) => {
        return t * t;
    };
    const QB2 = (t) => {
        return 2 * t * (1 - t);
    };
    const QB3 = (t) => {
        return (1 - t) * (1 - t);
    };
    const x = P3x * QB1(pct) + P2x * QB2(pct) + P1x * QB3(pct);
    const y = P3y * QB1(pct) + P2y * QB2(pct) + P1y * QB3(pct);

    return {
        x: x,
        y: y
    };
}

function calcLength(x, y, cmd, points) {
    let len, p1, p2, t;


    switch (cmd) {
        case "L":
            return getLineLength(x, y, points[0], points[1]);
        case "C":
            // Approximates by breaking curve into 100 line segments
            len = 0.0;
            p1 = getPointOnCubicBezier(0, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
            for (t = 0.01; t <= 1; t += 0.01) {
                p2 = getPointOnCubicBezier(t, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
                len += getLineLength(p1.x, p1.y, p2.x, p2.y);
                p1 = p2;
            }
            return len;
        case "Q":
            // Approximates by breaking curve into 100 line segments
            len = 0.0;
            p1 = getPointOnQuadraticBezier(0, x, y, points[0], points[1], points[2], points[3]);
            for (t = 0.01; t <= 1; t += 0.01) {
                p2 = getPointOnQuadraticBezier(t, x, y, points[0], points[1], points[2], points[3]);
                len += getLineLength(p1.x, p1.y, p2.x, p2.y);
                p1 = p2;
            }
            return len;
        case "A":
            // Approximates by breaking curve into line segments
            len = 0.0;
            const start = points[4];
            // 4 = theta
            const dTheta = points[5];
            // 5 = dTheta
            const end = points[4] + dTheta;
            let inc = Math.PI / 180.0;
            // 1 degree resolution
            if (Math.abs(start - end) < inc) {
                inc = Math.abs(start - end);
            }
            // Note: for purpose of calculating arc length, not going to worry about rotating X-axis by angle psi
            p1 = getPointOnEllipticalArc(points[0], points[1], points[2], points[3], start, 0);
            if (dTheta < 0) {// clockwise
                for (t = start - inc; t > end; t -= inc) {
                    p2 = getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
                    len += getLineLength(p1.x, p1.y, p2.x, p2.y);
                    p1 = p2;
                }
            }
            else {// counter-clockwise
                for (t = start + inc; t < end; t += inc) {
                    p2 = getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
                    len += getLineLength(p1.x, p1.y, p2.x, p2.y);
                    p1 = p2;
                }
            }
            p2 = getPointOnEllipticalArc(points[0], points[1], points[2], points[3], end, 0);
            len += getLineLength(p1.x, p1.y, p2.x, p2.y);

            return len;
    }

    return 0;
}

function parsePathData(data: string): Array<IPathData> {
    // Path Data Segment must begin with a moveTo
    // return early if data is not defined
    if (!data) {
        return [];
    }

    // command string
    let cs = data;

    // command chars
    const cc = ["m", "M", "l", "L", "v", "V", "h", "H", "z", "Z", "c", "C", "q", "Q", "t", "T", "s", "S", "a", "A"];
    // convert white spaces to commas
    cs = cs.replace(new RegExp(" ", "g"), ",");
    // create pipes so that we can split the data
    for (let n = 0; n < cc.length; n++) {
        cs = cs.replace(new RegExp(cc[n], "g"), "|" + cc[n]);
    }
    // create array
    const arr = cs.split("|");
    const ca = [];
    // init context point
    let cpx = 0;
    let cpy = 0;
    for (let n = 1; n < arr.length; n++) {
        let str = arr[n];
        let c = str.charAt(0);
        str = str.slice(1);
        // remove ,- for consistency
        str = str.replace(new RegExp(",-", "g"), "-");
        // add commas so that it's easy to split
        str = str.replace(new RegExp("-", "g"), ",-");
        str = str.replace(new RegExp("e,-", "g"), "e-");
        const pString = str.split(","), p: Array<number> = [];
        if (pString.length > 0 && pString[0] === "") {
            pString.shift();
        }
        // convert strings to floats
        for (let i = 0; i < pString.length; i++) {
            p.push(parseFloat(pString[i]));
        }
        while (p.length > 0) {
            if (isNaN(p[0])) { // case for a trailing comma before next command
                break;
            }

            let cmd = null;
            let points = [];
            const startX = cpx, startY = cpy;
            // Move var from within the switch to up here (jshint)
            let prevCmd, ctlPtx, ctlPty; // Ss, Tt
            let rx, ry, psi, fa, fs, x1, y1; // Aa


            // convert l, H, h, V, and v to L
            switch (c) {

                // Note: Keep the lineTo's above the moveTo's in this switch
                case "l":
                    cpx += p.shift();
                    cpy += p.shift();
                    cmd = "L";
                    points.push(cpx, cpy);
                    break;
                case "L":
                    cpx = p.shift();
                    cpy = p.shift();
                    points.push(cpx, cpy);
                    break;

                // Note: lineTo handlers need to be above this point
                case "m":
                    const dx = p.shift();
                    const dy = p.shift();
                    cpx += dx;
                    cpy += dy;
                    cmd = "M";
                    // After closing the path move the current position
                    // to the the first point of the path (if any).
                    if (ca.length > 2 && ca[ca.length - 1].command === "z") {
                        for (let idx = ca.length - 2; idx >= 0; idx--) {
                            if (ca[idx].command === "M") {
                                cpx = ca[idx].points[0] + dx;
                                cpy = ca[idx].points[1] + dy;
                                break;
                            }
                        }
                    }
                    points.push(cpx, cpy);
                    c = "l";
                    // subsequent points are treated as relative lineTo
                    break;
                case "M":
                    cpx = p.shift();
                    cpy = p.shift();
                    cmd = "M";
                    points.push(cpx, cpy);
                    c = "L";
                    // subsequent points are treated as absolute lineTo
                    break;

                case "h":
                    cpx += p.shift();
                    cmd = "L";
                    points.push(cpx, cpy);
                    break;
                case "H":
                    cpx = p.shift();
                    cmd = "L";
                    points.push(cpx, cpy);
                    break;
                case "v":
                    cpy += p.shift();
                    cmd = "L";
                    points.push(cpx, cpy);
                    break;
                case "V":
                    cpy = p.shift();
                    cmd = "L";
                    points.push(cpx, cpy);
                    break;
                case "C":
                    points.push(p.shift(), p.shift(), p.shift(), p.shift());
                    cpx = p.shift();
                    cpy = p.shift();
                    points.push(cpx, cpy);
                    break;
                case "c":
                    points.push(cpx + p.shift(), cpy + p.shift(), cpx + p.shift(), cpy + p.shift());
                    cpx += p.shift();
                    cpy += p.shift();
                    cmd = "C";
                    points.push(cpx, cpy);
                    break;
                case "S":
                    ctlPtx = cpx;
                    ctlPty = cpy;
                    prevCmd = ca[ca.length - 1];
                    if (prevCmd.command === "C") {
                        ctlPtx = cpx + (cpx - prevCmd.points[2]);
                        ctlPty = cpy + (cpy - prevCmd.points[3]);
                    }
                    points.push(ctlPtx, ctlPty, p.shift(), p.shift());
                    cpx = p.shift();
                    cpy = p.shift();
                    cmd = "C";
                    points.push(cpx, cpy);
                    break;
                case "s":
                    ctlPtx = cpx;
                    ctlPty = cpy;
                    prevCmd = ca[ca.length - 1];
                    if (prevCmd.command === "C") {
                        ctlPtx = cpx + (cpx - prevCmd.points[2]);
                        ctlPty = cpy + (cpy - prevCmd.points[3]);
                    }
                    points.push(ctlPtx, ctlPty, cpx + p.shift(), cpy + p.shift());
                    cpx += p.shift();
                    cpy += p.shift();
                    cmd = "C";
                    points.push(cpx, cpy);
                    break;
                case "Q":
                    points.push(p.shift(), p.shift());
                    cpx = p.shift();
                    cpy = p.shift();
                    points.push(cpx, cpy);
                    break;
                case "q":
                    points.push(cpx + p.shift(), cpy + p.shift());
                    cpx += p.shift();
                    cpy += p.shift();
                    cmd = "Q";
                    points.push(cpx, cpy);
                    break;
                case "T":
                    ctlPtx = cpx;
                    ctlPty = cpy;
                    prevCmd = ca[ca.length - 1];
                    if (prevCmd.command === "Q") {
                        ctlPtx = cpx + (cpx - prevCmd.points[0]);
                        ctlPty = cpy + (cpy - prevCmd.points[1]);
                    }
                    cpx = p.shift();
                    cpy = p.shift();
                    cmd = "Q";
                    points.push(ctlPtx, ctlPty, cpx, cpy);
                    break;
                case "t":
                    ctlPtx = cpx;
                    ctlPty = cpy;
                    prevCmd = ca[ca.length - 1];
                    if (prevCmd.command === "Q") {
                        ctlPtx = cpx + (cpx - prevCmd.points[0]);
                        ctlPty = cpy + (cpy - prevCmd.points[1]);
                    }
                    cpx += p.shift();
                    cpy += p.shift();
                    cmd = "Q";
                    points.push(ctlPtx, ctlPty, cpx, cpy);
                    break;
                case "A":
                    rx = p.shift();
                    ry = p.shift();
                    psi = p.shift();
                    fa = p.shift();
                    fs = p.shift();
                    x1 = cpx;
                    y1 = cpy;
                    cpx = p.shift();
                    cpy = p.shift();
                    cmd = "A";
                    points = convertEndpointToCenterParameterization(x1, y1, cpx, cpy, fa, fs, rx, ry, psi);
                    break;
                case "a":
                    rx = p.shift();
                    ry = p.shift();
                    psi = p.shift();
                    fa = p.shift();
                    fs = p.shift();
                    x1 = cpx;
                    y1 = cpy;
                    cpx += p.shift();
                    cpy += p.shift();
                    cmd = "A";
                    points = convertEndpointToCenterParameterization(x1, y1, cpx, cpy, fa, fs, rx, ry, psi);
                    break;
            }

            ca.push({
                command: cmd || c,
                points: points,
                start: {
                    x: startX,
                    y: startY
                },
                pathLength: calcLength(startX, startY, cmd || c, points)
            });
        }

        if (c === "z" || c === "Z") {
            ca.push({
                command: "z",
                points: [],
                start: undefined,
                pathLength: 0
            });
        }
    }

    return ca;
}
