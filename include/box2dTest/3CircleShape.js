import { BodyDef } from "./3BodyDef.js";
import { LocalPosition } from "./3CircleShape/LocalPosition.js";
import { Radius } from "./3CircleShape/Radius.js";

export class CircleShape extends BodyDef {
    constructor() {
        super();
        this.demoList=[
            Radius,
            LocalPosition
        ]
    }
}
