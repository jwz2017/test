import { BodyDef } from "./3BodyDef.js";
import { Density } from "./3FixtureDef/Density.js";
import { Filter } from "./3FixtureDef/Filter.js";
import { Friction } from "./3FixtureDef/Friction.js";
import { IsSensor } from "./3FixtureDef/IsSensor.js";
import { Restitution } from "./3FixtureDef/Restitution.js";
import { Shape } from "./3FixtureDef/Shape.js";

export class FixtureDef extends BodyDef {
    constructor() {
        super();
        this.demoList = [
            Density,
            Filter,
            Friction,
            IsSensor,
            Restitution,
            Shape
        ]
    }

}
