import { gframe, queue } from "../classes/gframe.js";
import { hitTest } from "./moveTest/0hitTest.js";
import { DomElement } from "./moveTest/0domElement.js";
import { Graphics } from "./moveTest/0Graphics.js";
import { LoadBitmap } from "./moveTest/0LoadBitmap.js";
import { Mctest } from "./moveTest/0mcTest.js";
import { Chain } from "./moveTest/1chain.js";
import { Billiard } from "./moveTest/1billiard.js";
import { Billiard2 } from "./moveTest/1billiard2.js";
import { Particle } from "./moveTest/1particle.js";
import { NodeGarden } from "./moveTest/1nodeGarden.js";
import { RectRotate } from "./moveTest/0rectRotate.js";
import { SingleSegment } from "./moveTest/1segment.js";
import { SegmentWalk } from "./moveTest/1segmentWalk.js";
import { SegmentDrag } from "./moveTest/1segmentDrag.js";
import { SegmentReach } from "./moveTest/1segmentReach.js";
import { SegmentCosines } from "./moveTest/1segmentCosines.js";
import { Perspective1 } from "./moveTest/2perspective1.js";
import { Velocity3D } from "./moveTest/2Velocity3D.js";
import { MultiBounce3D } from "./moveTest/2MultiBounce3D.js";
import { FireWork } from "./moveTest/2FireWork.js";
import { Trees } from "./moveTest/2Trees.js";
import { Easing3d } from "./moveTest/2Easing3d.js";
import { Spring3D } from "./moveTest/2Spring3D.js";
import { RotateY } from "./moveTest/2RotateY.js";
import { Collision3D } from "./moveTest/2Collision3D.js";
import { Lines3D } from "./moveTest/3Lines3D.js";
import { Square3D } from "./moveTest/3Square3D.js";
import { Triangles } from "./moveTest/3Triangles.js";
import { Cube } from "./moveTest/3Cube.js";
import { Brownian } from "./moveTest/4brownian.js";
import { Random } from "./moveTest/4random.js";
import { Random2 } from "./moveTest/4random2.js";
import { VehiclSeek } from "./moveTest2/0SeekTest.js";
import { VehiclFlee } from "./moveTest2/0FleeTest.js";
import { FleeTest1 } from "./moveTest2/0FleeTest1.js";
import { FleeTest2 } from "./moveTest2/0FleeTest2.js";
import { VehiclArrive } from "./moveTest2/0ArriveTest.js";
import { VehiclPursue } from "./moveTest2/0PursueTest.js";
import { PursueEvade } from "./moveTest2/0PursueEvadeTest.js";
import { WanderTest } from "./moveTest2/0WanderTest.js";
import { AvoidTest } from "./moveTest2/0AvoidTest.js";
import { PathTest } from "./moveTest2/0PathTest.js";
import { FlockTest } from "./moveTest2/0FlockTest.js";
import { isoTransformTest } from "./moveTest2/1isoTransformTest.js";
import { TileTest } from "./moveTest2/1TileTest.js";
import { MotionTest } from "./moveTest2/1MotionTest.js";
import { MotionTest2 } from "./moveTest2/1MotionTest2.js";
import { Collision } from "./moveTest2/1Collision.js";
import { GraphicsTileTest } from "./moveTest2/1graphicsTileTest.js";
import { MapTest } from "./moveTest2/1maptest.js";
import { AStarTest } from "./moveTest2/2aStar.js";
import { AstarMove } from "./moveTest2/2astarMove.js";
import { RandomDice } from "./moveTest/0randomDice.js";
import { ScoreTest } from "./moveTest/0scoreTest.js";
import { DestroyFixture } from "./box2dTest/4destroyFixture.js";
import { ApplyForce } from "./box2dTest/4ApplyForce.js";
import { ApplyImpulse } from "./box2dTest/4ApplyImpulse.js";
import { ApplyTorque } from "./box2dTest/4ApplyTorque.js";
import { GetMass } from "./box2dTest/4GetMass.js";
import { SetMassData } from "./box2dTest/4SetMassData.js";
import { QueryAABB } from "./box2dTest/4QueryAABB.js";
import { RayCast } from "./box2dTest/4RayCast.js";
import { Gravition } from "./box2dTest/4Gravition.js";
import { NomalImpulse } from "./box2dTest/4NomalImpulse.js";
import { OneWayWall } from "./box2dTest/4OneWaywall.js";
import { AniGravityAttach } from "./box2dTest/4AntiGravityAttach.js";
import { MouseJoint } from "./box2dTest/6MouseJoint.js";
import { PrimaticJoint } from "./box2dTest/6PrimaticJoint.js";
import { RevoluteJoint } from "./box2dTest/6RevoluteJoint.js";
import { Filter } from "./box2dTest/4Filter.js";
import { DistanceJoint } from "./box2dTest/6DistanceJoint.js";
import { WeldJoint } from "./box2dTest/6WeldJoint.js";
import { PulleyJoint } from "./box2dTest/6PulleyJoint.js";
import { FrictionJoint } from "./box2dTest/6FrictionJoint.js";
import { GearJoint } from "./box2dTest/6GearJoint.js";
import { WheelJoint } from "./box2dTest/6WheelJoint.js";
import { RopeJoint } from "./box2dTest/6RopeJoint.js";
import { MotorJoint } from "./box2dTest/6MotorJoint.js";
import { SoftBody1 } from "./box2dTest/7SoftBody1.js";
import { SoftBody2 } from "./box2dTest/7SoftBody2.js";
import { ClipperDemo } from "./box2dTest/7Clipper.js";
import { WaterDome } from "./box2dTest/7waterDome.js";
import { IceBreaker } from "./box2dTest/7IceBreakerDemo.js";
import { AlphaMaskFilter } from "./easelJsTest/AlphaMaskFilter.js";
import { Pannel } from "../classes/dat.gui-pannel.js";
import { ButtonHelp } from "./easelJsTest/ButtonHelp.js";
import { FilterAnimated } from "./easelJsTest/FilterAnimated.js";
import { FiltersInput } from "./easelJsTest/FiltersInput.js";
import { SpritesheetBuilder } from "./easelJsTest/SpritesheetBuilder.js";
import { SpriteSheetMovie } from "./easelJsTest/SpriteSheetMovie.js";
import { TextLinkTest } from "./easelJsTest/TextLink.js";
import { ScaleBitmapTest } from "./easelJsTest/ScaleBitmapTest.js";
// window.onload = function () {
    Box2D().then(function (r) {
        Box2D = r;
        using(Box2D, 'b2.+');
    })
    /*************游戏入口*****/
    gframe.buildStage('canvas');
    gframe.pannel=new Pannel()
// };
//关闭按钮点击
closeGame.onclick = function (e) {
    if(queue.loaded){
        e.target.parentNode.style.display = "none";
        //应许滚动
        document.getElementsByTagName('body')[0].setAttribute('style', 'position:relative;');
        gframe.reset();
    }
}
//收缩，展开
var genduo1 = document.getElementById("genduo1"),
    genduo2 = document.getElementById("genduo2"),
    genduo3 = document.getElementById("genduo3"),
    genduo4 = document.getElementById("genduo4"),
    pro_con1 = document.getElementById("pro_con1"),
    pro_con2 = document.getElementById("pro_con2"),
    pro_con3 = document.getElementById("pro_con3"),
    pro_con4 = document.getElementById("pro_con4");
genduo1.onclick = function (e) {
    genduo(e, pro_con1);
};
genduo2.onclick = function (e) {
    genduo(e, pro_con2);
};
genduo3.onclick = function (e) {
    genduo(e, pro_con3);
};
genduo4.onclick = function (e) {
    genduo(e, pro_con4);
};

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
    gframe.preload(eval(a.title),true,"./assets/");
}