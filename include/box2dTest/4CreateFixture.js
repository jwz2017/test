import { BodyDef } from "./3BodyDef.js";

export class CreateFixture extends BodyDef {
    constructor() {
        super();
        this.demoList=[
            CreateFixture1
        ]
    }

}


import { game } from "../../classes/gframe.js";
import { AbstractDemo } from "./3BodyDef/AbstractDemo.js";
var shapeMapList, boxSize = 15, counter = 0;
export class CreateFixture1 extends AbstractDemo {
    constructor() {
        super("createFixtur1", 5);
    }
    ready() {
        var Z = [1, 1, 0,
            0, 1, 1,
            0, 0, 0];
        var S = [0, 1, 1,
            1, 1, 0,
            0, 0, 0];
        var L = [1, 0, 0,
            1, 0, 0,
            1, 1, 0];
        var L2 = [0, 1, 0,
            0, 1, 0,
            1, 1, 0];
        var T = [1, 1, 1,
            0, 1, 0,
            0, 0, 0];
        var M = [1, 1, 1,
            1, 0, 1,
            0, 0, 0];
        var X = [0, 1, 0,
            1, 1, 1,
            0, 1, 0];
        var O = [1, 1, 0,
            1, 1, 0,
            0, 0, 0];
        shapeMapList = [];
        shapeMapList.push(Z, T, L, M, X, O, S, L2);

        game.editValue("")
        
    }
    createBody(x, y, map) {
        bodyDef = bodyDef || new b2BodyDef();
        bodyDef.type = 2;
        bodyDef.position.Set(x / PTM, y / PTM);

        fixtureDef = fixtureDef || new b2FixtureDef();
        fixtureDef.set_density(1);
        fixtureDef.set_restitution(0);

        let body = world.CreateBody(bodyDef);

        let bx, by;
        tempVec=tempVec||new b2Vec2();
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if(map[r*3+c]==1){
                    bx=c*boxSize;
                    by=r*boxSize;
                    tempVec.Set(bx/PTM,by/PTM);
                    let shape=new b2PolygonShape();
                    shape.SetAsBox(boxSize/PTM/2,boxSize/PTM/2,tempVec,0);
                    fixtureDef.set_shape(shape);
                    body.CreateFixture(fixtureDef);
                    Box2D._free(shape.a)
                }
            }

        }
        return body;
    }

    update(){
        if(++counter>50){
            counter=0;
            this.createBody(Math.random()*50+350,50,shapeMapList[Math.floor(Math.random()*shapeMapList.length)])
        }
    }
}
