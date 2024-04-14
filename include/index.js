import { stage, gframe, game, queue } from "../classes/gframe.js";
import { hitTest } from "./test/0hitTest.js";
import { DomElement } from "./test/0domElement.js";
import { Graphics } from "./test/0Graphics.js";
import { LoadBitmap } from "./test/0LoadBitmap.js";
import { Mctest } from "./test/0mcTest.js";
import { Chain } from "./test/1chain.js";
import { Billiard } from "./test/1billiard.js";
import { Billiard2 } from "./test/1billiard2.js";
import { Particle } from "./test/1particle.js";
import { NodeGarden } from "./test/1nodeGarden.js";
import { RectRotate } from "./test/0rectRotate.js";
import { SingleSegment } from "./test/1segment.js";
import { SegmentWalk } from "./test/1segmentWalk.js";
import { SegmentDrag } from "./test/1segmentDrag.js";
import { SegmentReach } from "./test/1segmentReach.js";
import { SegmentCosines } from "./test/1segmentCosines.js";
import { Perspective1 } from "./test/2perspective1.js";
import { Velocity3D } from "./test/2Velocity3D.js";
import { MultiBounce3D } from "./test/2MultiBounce3D.js";
import { FireWork } from "./test/2FireWork.js";
import { Trees } from "./test/2Trees.js";
import { Easing3d } from "./test/2Easing3d.js";
import { Spring3D } from "./test/2Spring3D.js";
import { RotateY } from "./test/2RotateY.js";
import { Collision3D } from "./test/2Collision3D.js";
import { Lines3D } from "./test/3Lines3D.js";
import { Square3D } from "./test/3Square3D.js";
import { Triangles } from "./test/3Triangles.js";
import { Cube } from "./test/3Cube.js";
import { Brownian } from "./test/4brownian.js";
import { Random } from "./test/4random.js";
import { Random2 } from "./test/4random2.js";
import { VehiclSeek } from "./test2/0SeekTest.js";
import { VehiclFlee } from "./test2/0FleeTest.js";
import { FleeTest1 } from "./test2/0FleeTest1.js";
import { FleeTest2 } from "./test2/0FleeTest2.js";
import { VehiclArrive } from "./test2/0ArriveTest.js";
import { VehiclPursue } from "./test2/0PursueTest.js";
import { PursueEvade } from "./test2/0PursueEvadeTest.js";
import { WanderTest } from "./test2/0WanderTest.js";
import { AvoidTest } from "./test2/0AvoidTest.js";
import { PathTest } from "./test2/0PathTest.js";
import { FlockTest } from "./test2/0FlockTest.js";
import { isoTransformTest } from "./test2/1isoTransformTest.js";
import { TileTest } from "./test2/1TileTest.js";
import { MotionTest } from "./test2/1MotionTest.js";
import { MotionTest2 } from "./test2/1MotionTest2.js";
import { Collision } from "./test2/1Collision.js";
import { GraphicsTileTest } from "./test2/1graphicsTileTest.js";
import { MapTest } from "./test2/1maptest.js";
import { AStarTest } from "./test2/2aStar.js";
import { AstarMove } from "./test2/2astarMove.js";
import { RandomDice } from "./test/0randomDice.js";
import { ScoreTest } from "./test/0scoreTest.js";
import { DestroyFixture } from "./box2d/4destroyFixture.js";
import { ApplyForce } from "./box2d/4ApplyForce.js";
import { ApplyImpulse } from "./box2d/4ApplyImpulse.js";
import { ApplyTorque } from "./box2d/4ApplyTorque.js";
import { GetMass } from "./box2d/4GetMass.js";
import { SetMassData } from "./box2d/4SetMassData.js";
import { QueryAABB } from "./box2d/4QueryAABB.js";
import { RayCast } from "./box2d/4RayCast.js";
import { Gravition } from "./box2d/4Gravition.js";
import { NomalImpulse } from "./box2d/4NomalImpulse.js";
import { OneWayWall } from "./box2d/4OneWaywall.js";
import { AniGravityAttach } from "./box2d/4AntiGravityAttach.js";
import { MouseJoint } from "./box2d/6MouseJoint.js";
import { PrimaticJoint } from "./box2d/6PrimaticJoint.js";
import { RevoluteJoint } from "./box2d/6RevoluteJoint.js";
import { Filter } from "./box2d/4Filter.js";
import { DistanceJoint } from "./box2d/6DistanceJoint.js";
import { WeldJoint } from "./box2d/6WeldJoint.js";
import { PulleyJoint } from "./box2d/6PulleyJoint.js";
import { FrictionJoint } from "./box2d/6FrictionJoint.js";
import { GearJoint } from "./box2d/6GearJoint.js";
import { WheelJoint } from "./box2d/6WheelJoint.js";
import { RopeJoint } from "./box2d/6RopeJoint.js";
import { MotorJoint } from "./box2d/6MotorJoint.js";
import { SoftBody1 } from "./box2d/7SoftBody1.js";
import { SoftBody2 } from "./box2d/7SoftBody2.js";
import { ClipperDemo } from "./box2d/7Clipper.js";
import { WaterDome } from "./box2d/7waterDome.js";
import { IceBreaker } from "./box2d/7IceBreakerDemo.js";
window.onload = function () {
    Box2D().then(function (r) {
        Box2D = r;
        using(Box2D, 'b2.+');
    })
    /*************游戏入口*****/
    gframe.buildStage('canvas');
};
//关闭按钮点击
closeGame.onclick = function (e) {
    e.target.parentNode.style.display = "none";
    //应许滚动
    document.getElementsByTagName('body')[0].setAttribute('style', 'position:relative;');
    gframe.reset();
}
//收缩，展开
var genduo1 = document.getElementById("genduo1"),
    genduo2 = document.getElementById("genduo2"),
    pro_con1 = document.getElementById("pro_con1"),
    pro_con2 = document.getElementById("pro_con2");
genduo1.onclick = function (e) {
    genduo(e, pro_con1);
};
genduo2.onclick = function (e) {
    genduo(e, pro_con2);
}

function genduo(e, pro_con1) {
    if (pro_con1.style.display === "none") {
        pro_con1.style.display = "block";
        e.target.textContent = "收缩>"
    } else {
        pro_con1.style.display = "none";
        e.target.textContent = "更多>";
    }
}

//练习内容点击
window.productClick = function (a) {
    containerDiv.style.display = "block";
    //禁止滚动
    document.getElementsByTagName('body')[0].setAttribute('style', 'position:fixed; width:100%;');
    gframe.preload(eval(a.title), true);
}