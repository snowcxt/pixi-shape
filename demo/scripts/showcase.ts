/// <reference path="./box2dweb.d.ts" />
import {Stage} from "../../src/Core";
import {Image, ImageTexture} from "../../src/Image";
import {RegularPolygon} from "../../src/RegularPolygon";
import {Group} from "../../src/Group";
import {Text} from "../../src/Text";
import {Tween} from "../../src/Animation";
import {Line} from "../../src/Line";
import {Circle} from "../../src/Circle";

declare var require: any;
declare var FPSMeter: any;

const showcase = require("../styles/home-showcase.jpg");

const radius = 0.4;
const scale = 30.0;
const b2Vec2 = Box2D.Common.Math.b2Vec2,
    b2AABB = Box2D.Collision.b2AABB,
    b2BodyDef = Box2D.Dynamics.b2BodyDef,
    b2Body = Box2D.Dynamics.b2Body,
    b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
    b2Fixture = Box2D.Dynamics.b2Fixture,
    b2World = Box2D.Dynamics.b2World,
    b2MassData = Box2D.Collision.Shapes.b2MassData,
    b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
    b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
    b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
    b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;

export function init() {
    const world = new b2World(new b2Vec2(0, 0), true);

    function collision(userData) {
        if (userData != null) {
            shapeList[parseInt(userData)].collision();
        }
    }

    // linsterner
    const b2Listener = Box2D.Dynamics.b2ContactListener;

    // Add listeners for contact
    const listener = new b2Listener;
    listener.PostSolve = (contact, impulse) => {
        const force = impulse.normalImpulses[0];
        if (force > 0.5) {
            collision(contact.GetFixtureA().GetBody().GetUserData());
            collision(contact.GetFixtureB().GetBody().GetUserData());
        }
    };

    world.SetContactListener(listener);

    const fixDef = new b2FixtureDef;
    fixDef.density = 1.0;
    fixDef.friction = 2;
    fixDef.restitution = 1;

    const bodyDef = new b2BodyDef;

    // create ground
    bodyDef.type = b2Body.b2_staticBody;
    fixDef.shape = new b2PolygonShape;
    (<Box2D.Collision.Shapes.b2PolygonShape>fixDef.shape).SetAsBox(20, 2);
    bodyDef.position.Set(10, 400 / 30 + 1.8);
    world.CreateBody(bodyDef).CreateFixture(fixDef);
    bodyDef.position.Set(10, -1.8);
    world.CreateBody(bodyDef).CreateFixture(fixDef);
    (<Box2D.Collision.Shapes.b2PolygonShape>fixDef.shape).SetAsBox(2, 14);
    bodyDef.position.Set(-1.8, 13);
    world.CreateBody(bodyDef).CreateFixture(fixDef);
    bodyDef.position.Set(21.8, 13);
    world.CreateBody(bodyDef).CreateFixture(fixDef);

    const stage = new Stage(600, 400, <HTMLCanvasElement>document.getElementById("stage"), { webgl: false });
    const back = new Image({
        x: 0,
        y: 0,
        image: new ImageTexture(showcase)
    });
    stage.add(back);

    const warm = new Worm(stage);
    const explosion = new Group({});
    stage.add(explosion);

    stage.add(new Text({
        x: 380,
        y: 360,
        fill: 0x888888,
        fontSize: 18,
        fontFamily: "Arial",
        text: "Click to drive the triangles"
    }));

    const shapeList: Shape[] = [];

    // create some objects
    bodyDef.type = b2Body.b2_dynamicBody;
    for (let i = 0; i < 30; ++i) {
        const shape = new b2PolygonShape(),
            x = Math.random() * 10,
            y = Math.random() * 10,
            vs = [];

        for (let n = 0; n < 3; n++) {
            vs.push(new b2Vec2(radius * Math.sin(n * 2 * Math.PI / 3), -1 * radius * Math.cos(n * 2 * Math.PI / 3)));
        }

        shape.SetAsArray(vs, 3);
        fixDef.shape = shape;

        bodyDef.position.x = x;
        bodyDef.position.y = y;

        const body = world.CreateBody(bodyDef);
        body.CreateFixture(fixDef);

        shapeList.push(new Shape(i, body, stage, explosion, x, y));
    }

    const meter = new FPSMeter(document.body, {
        theme: "transparent",
        heat: true,
        graph: true
    });
    stage.startAnim(() => {
        shapeList.forEach((s) => {
            s.animate();
        });
        warm.animate();
        meter.tick();
    });

    function getCellByMouseData(mouseData) {
        const localCoordsPosition = mouseData.getLocalPosition(stage.stage);
        const x = localCoordsPosition.x, y = localCoordsPosition.y;
        return { x: x, y: y };
    }
    stage.stage.interactive = true;
    const mouseEvent = (mouseData) => {
        const position = mouseData.data.getLocalPosition(stage.stage);
        const hit = new Circle({
            x: position.x,
            y: position.y,
            stroke: 0xFFFF00,
            strokeWidth: 3,
            radius: 1
        });
        stage.add(hit);
        hit.tween(1, {
            radius: 40,
            strokeOpacity: 0
        }).play({
            done: () => {
                hit.clear();
            }
        });
        shapeList.forEach((s) => {
            s.impulse(position);
        });
    };
    stage.stage.on("mousedown", mouseEvent).on("touchstart", mouseEvent);

    shapeList.forEach((s) => {
        s.impulse({ x: 600 * Math.random(), y: 400 * Math.random() });
    });

    window.setInterval(update, 1000 / 60);

    // update
    function update() {
        world.Step(1 / 60, 10, 10);
        world.DrawDebugData();
        world.ClearForces();

        shapeList.forEach((s) => { s.sync(); });
    }
}

function explode(x, y, size, color, explosion: Group) {
    const v = { x: Math.random() * 3 * 2 - 3, y: Math.random() * 3 * 2 - 3 };
    const c = new RegularPolygon({
        sides: 3,
        x: x + v.x,
        y: y + v.y,
        radius: size,
        fill: color,
        rotation: Math.random()
    });

    explosion.add(c);
    c.tween(1, {
        opacity: 0,
        x: x + v.x * 50,
        y: y + v.y * 50
    }).play({
        done: () => {
            c.clear();
        }
    });
}

class Shape {
    body: Box2D.Dynamics.b2Body;
    shape1: RegularPolygon;
    shape2: RegularPolygon;
    stage: Stage;
    explosion: Group;
    step: number;
    collisionTween: Tween;

    constructor(index: number, body: Box2D.Dynamics.b2Body, stage: Stage, explosion: Group, x: number, y: number) {
        body.SetUserData(index);

        const offset2 = { x: radius * scale / 4, y: 0 },
            rotation = Math.random();

        this.shape2 = new RegularPolygon({
            sides: 3,
            radius: radius * 1.1 * scale,
            stroke: 0x4499d6,
            strokeWidth: 2,
            pivotX: offset2.x,
            pivotY: offset2.y,
            rotation: rotation
        });

        this.shape1 = new RegularPolygon({
            sides: 3,
            radius: radius * 0.9 * scale,
            fill: 0xa0f69d,
            stroke: 0x4499d6,
            strokeWidth: 2,
            rotation: rotation
        });
        // this.group.add(this.shape1);

        stage.add(this.shape2);
        stage.add(this.shape1);

        this.body = body;
        this.stage = stage;
        this.explosion = explosion;
        this.step = (Math.random() - 0.5) * 0.2;
        this.collisionTween = this.shape1.tween(0.5, {
            fill: 0xFF0000,
            radius: 20
        });
    }

    public animate() {
        this.shape2.rotate(this.step);
    }

    public sync() {
        const position = this.body.GetPosition(),
            rotation = this.body.GetAngle();

        this.shape1.setAttrs({
            x: position.x * scale,
            y: position.y * scale,
            rotation: rotation
        });
        this.shape2.setPostion(position.x * scale, position.y * scale);

        if (Math.random() < 0.3) {
            explode(position.x * scale, position.y * scale, 3, this.shape1.getAttr("fill"), this.explosion);
        }
    }

    public impulse(position: { x: number; y: number; }) {
        const p = this.body.GetPosition(),
            x = position.x / scale - p.x,
            y = position.y / scale - p.y;

        this.body.ApplyImpulse(new b2Vec2(x, y), this.body.GetWorldCenter());
    }

    public collision() {
        this.collisionTween.play({
            done: () => {
                this.collisionTween.reverse();
            }
        });
    }
}

class Worm {
    pointsNum = 50;
    width = 600;
    height = 400;
    points;
    worm;

    constructor(stage: Stage) {
        this.points = [];
        for (let i = 0; i < this.pointsNum; i++) {
            this.points.push({ x: Math.random() * this.width, y: Math.random() * this.height });
        }

        this.worm = new Line({
            points: this.points,
            fill: 0x020202,
            strokeWidth: 2,
            stroke: 0x010101,
            strokeOpacity: 0.4,
            closed: true,
            opacity: 0.2
        });

        stage.add(this.worm);
    }

    public animate() {
        if (Math.random() < 0.1) {
            this.points[Math.floor(Math.random() * this.pointsNum)] = { x: Math.random() * this.width, y: Math.random() * this.height };
            this.worm.setAttrs({ points: this.points });
        }
    }
}
