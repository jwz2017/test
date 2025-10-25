import { Vector } from "../actor.js";
/**
 * 飞机移动 八方向移动
 * @param {object} actor 
 * @param {number} velocity 速度
 * @param {boolean} keys 按键方向
 */
export function planeMove(actor, velocity, keys) {
    let speed=actor.speed;
    speed.zero();
    if (keys.left) {
        speed.x = -velocity;
    } else if (keys.right) {
        speed.x = velocity;
    }
    if (keys.up) {
        speed.y = -velocity;
        speed.length = velocity;
    } else if (keys.down) {
        speed.y = velocity;
        speed.length = velocity;
    }
}

/**
 * 坦克移动   四方向移动
 * @param {*} actor 
 * @param {*} velocity 
 * @param {*} keys 
 */
export function tankMove(actor,velocity, keys) {
    actor.speed.zero();
    if (keys) actor.image.paused = false;
    else actor.image.paused = true;
    switch (keys) {
        case "up":
            actor.speed.y = -velocity;
            actor.rotation = -90;
            break;
        case "down":
            actor.speed.y = velocity;
            actor.rotation = 90;
            break;
        case "right":
            actor.speed.x = velocity;
            actor.rotation = 0;
            break;
        case "left":
            actor.speed.x = -velocity;
            actor.rotation = 180;
            break;
    }
}

export class MoveManage {
    constructor() {
        //转向作用力
        this.steeringForce = new Vector();
        //作用力最大length
        this.maxForce = 0.8;
        //到达范围开始减速
        this.arrivalThreshold = 100;
        //漫游圆心距离
        this.wanderDistance = 10;
        this.wanderRadius = 5;
        this.wanderAngle = 0;
        this.wanderRange = Math.PI / 2;//漫游角度范围
        //回避距离 发现障碍物有效视野
        this.avoidDistance = 300;
        this.avoidBuffer = 20;//回避缓冲 准备避开时，自身和障碍物间的预留距离
        //路径
        this.pathThreshold = 20;
        //群落 最小距离
        this.tooCloseDist = 60;
        //进入视野
        this.inSightDist=200;
    }
    
    /**
     * 键盘开车
     * @param {Actor} actor 
     * @param {object} keys 键盘对象
     */
    driveCar(actor, keys) {
        if (keys.right) {
            this.steeringForce.length = this.maxForce;
            this.steeringForce.angle = 0;
        }
        if (keys.down) {
            this.steeringForce.length = this.maxForce;
            this.steeringForce.angle = Math.PI / 2;
        }
        if (keys.left) {
            this.steeringForce.length = this.maxForce;
            this.steeringForce.angle = Math.PI;
        }
        if (keys.up) {
            this.steeringForce.length = this.maxForce;
            this.steeringForce.angle = -Math.PI / 2;
        }
        this._act(actor);
    }
    /**
     * 控制飞船
     * @param {*} actor 
     * @param {*} keys 
     * @param {5} rV 旋转速度
     * @param {0.05} aV 加速度
     */
    driveShip(actor, keys,rV=5,aV=0.05) {
        if (keys.left) {
            actor.rotation -= rV;
        } else if (keys.right) {
            actor.rotation += rV;
        }
        if (keys.up) {
            this.accelerate(actor,aV);
        }
    }
    accelerate(actor,aV) {
        this.steeringForce.length=aV;
        this.steeringForce.angle = actor.rotation * Math.PI / 180;

        this.steeringForce.truncate(this.maxForce);
        this.steeringForce.mul(1 / actor.mass);
        actor.speed.add(this.steeringForce);
        this.steeringForce.setValues(0, 0);
    }
    _act(actor) {
        this.steeringForce.truncate(this.maxForce);
        this.steeringForce.mul(1 / actor.mass);
        actor.speed.add(this.steeringForce);
        this.steeringForce.setValues(0, 0);
        actor.rotation = actor.speed.angle * 180 / Math.PI;
    }
    //寻找行为 
    seek(actor, target) {
        let centerPos = new Vector(actor.x, actor.y);
        let targetcenterPos = new Vector(target.x, target.y);
        let desiredVelocity = targetcenterPos.sub(centerPos);
        desiredVelocity.normalize();
        desiredVelocity.mul(actor.maxSpeed);
        let force = desiredVelocity.sub(actor.speed);
        this.steeringForce.add(force);
        this._act(actor);
    }
    /**
     * 逃离行为
     * @param {*} actor 
     * @param {*} target 
     * @param {5} fleeSpeed 逃离速度
     */
    flee(actor, target, fleeSpeed = actor.maxSpeed) {
        let centerPos = new Vector(actor.x, actor.y);
        let targetcenterPos = new Vector(target.x, target.y);
        let desiredVelocity = targetcenterPos.sub(centerPos);
        desiredVelocity.normalize();
        desiredVelocity.mul(fleeSpeed);
        let force = desiredVelocity.sub(actor.speed);
        this.steeringForce.sub(force);
        this._act(actor);
    }
    //到达行为
    arrive(actor, targetPos) {
        let centerPos = new Vector(actor.x, actor.y);
        let desiredVelocity = Vector.sub(targetPos, centerPos)
        desiredVelocity.normalize();
        let dist = centerPos.dist(targetPos);
        if (dist > this.arrivalThreshold) {
            desiredVelocity.mul(actor.maxSpeed);
        } else {
            desiredVelocity.mul(actor.maxSpeed * dist / this.arrivalThreshold);
        }
        let force = desiredVelocity.sub(actor.speed);
        this.steeringForce.add(force);
        this._act(actor);
    }
    /**
     * 追捕行为 对预判点为目标
     * @param {Actor} actor Actor
     * @param {Actor} target Actor
     */
    pursue(actor, target) {
        let centerPos = new Vector(actor.x, actor.y);
        let targetcenterPos = new Vector(target.x, target.y);
        let lookAheadTime = centerPos.dist(targetcenterPos) / actor.maxSpeed;
        let predictedTarget = targetcenterPos.add(Vector.mul(target.speed, lookAheadTime));
        this.seek(actor, predictedTarget);
    }
    /**
     * 躲避行为 以预判点反方向逃离
     * @param {Actor} actor actor类型
     * @param {Actor} target actor类型
     */
    evade(actor, target) {
        let centerPos = new Vector(actor.x, actor.y);
        let targetcenterPos = new Vector(target.x, target.y);
        let lookAheadTime = centerPos.dist(targetcenterPos) / actor.maxSpeed;
        let predictedTarget = targetcenterPos.add(Vector.mul(target.speed, lookAheadTime));
        this.flee(actor, predictedTarget);
    }
    /**
     * 漫游行为
     * @param {*} actor 
     */
    wander(actor) {
        let center = actor.speed.clone().normalize().mul(this.wanderDistance);
        let offset = new Vector();
        offset.length = this.wanderRadius;
        offset.angle = this.wanderAngle;
        this.wanderAngle += Math.random() * this.wanderRange - this.wanderRange * .5;
        let force = center.add(offset);
        this.steeringForce.add(force);
        this._act(actor);
    }
    /**
     * 回避行为 避开障碍物
     * @param {Actor} actor 
     * @param {Array} circles 障碍物数组
     */
    avoid(actor, circles) {
        for (let i = 0; i < circles.length; i++) {
            const circle = circles[i];
            const heading = actor.speed.clone().normalize();
            const centerPos = new Vector(actor.x, actor.y);
            const circlescenterPos = new Vector(circle.x, circle.y);
            //障碍物和机车间的位移向量
            const difference = circlescenterPos.sub(centerPos);
            const dotProd = difference.dot(heading);
            //如果障碍物在机车前方
            if (dotProd > 0) {
                //机车的“触角”
                let feeler = Vector.mul(heading, this.avoidDistance);
                //位移在触角上的映射
                let projection = Vector.mul(heading, dotProd);
                //障碍物离触角的距离
                let dist = Vector.sub(projection, difference).length;
                // 如果触角（在算上缓冲后）和障碍物相交 
                // 并且位移的映射的长度小于触角的长度 
                // 我们就说碰撞将要发生，需改变转向
                if (dist < circle.hit + this.avoidBuffer && projection.length < feeler.length) {
                    //计算出一个转90度的力
                    let force = Vector.mul(heading, actor.maxSpeed);

                    let a = difference.crossProd(actor.speed) > 0 ? 1 : -1;
                    force.angle += a * Math.PI / 2;
                    // force.angle += difference.sign(actor.speed) * Math.PI / 2;
                    // 通过离障碍物的距离，调整力度大小，使之足够小但又能避开 
                    force.mul(1 - projection.length / feeler.length);
                    //叠加于转向力上
                    this.steeringForce.add(force);
                    //刹车————转弯的时候要放慢机车速度，离障碍物越接近，刹车越狠。
                    actor.speed.mul(projection.length / feeler.length);
                }
            }
        }
        this._act(actor);
    }

    /**
     * 路径跟随
     * @param {Actor} actor 
     * @param {Array} path Vector数组
     * @param {Boolean} loop false
     */
    followPath(actor, path, loop = false) {
        actor.pathIndex = actor.pathIndex || 0;
        let wayPoint = path[actor.pathIndex];
        let centerPos = new Vector(actor.x, actor.y);
        if (!wayPoint) return;
        if (centerPos.dist(wayPoint) < this.pathThreshold) {
            if (actor.pathIndex >= path.length - 1) {
                if (loop) {
                    actor.pathIndex = 0;
                }
            } else {
                actor.pathIndex++;
            }
        }
        if (actor.pathIndex >= path.length - 1 && !loop) {
            this.arrive(actor, wayPoint);
        } else {
            this.seek(actor, wayPoint);
        }
    }
    /**
     * 群落行为
     * @param {Actor} actor 
     * @param {Array} vehicles 机车数组
     */
    flock(actor, vehicles) {
        let averageVelocity = actor.speed.clone();
        let averagePosition = new Vector(0, 0);
        let inSightCount = 0;
        for (let i = 0; i < vehicles.length; i++) {
            const vehicle = vehicles[i];
            if (vehicle != actor && this.inSight(actor,vehicle)) {
                averageVelocity.add(vehicle.speed);
                averagePosition.x += vehicle.x;
                averagePosition.y += vehicle.y;
                if (this.tooClose(actor, vehicle)) this.flee(actor, vehicle);
                inSightCount++;
            }
        }
        if (inSightCount > 0) {
            averageVelocity.mul(1 / inSightCount);
            averagePosition.mul(1 / inSightCount);
            this.seek(actor, averagePosition);
            this.steeringForce.add(averageVelocity.mul(1 / inSightCount));
            this._act(actor);
        }
    }

     /**
   * 是否进入视野
   * @param {Actor} actor 
   * @param {Actor} vehicle 
   * @returns boolen
   */
  inSight(actor,vehicle) {
    let centerPos = new Vector(actor.x, actor.y);
    let targetcenterPos = new Vector(vehicle.x, vehicle.y);
    if (centerPos.dist(targetcenterPos) > this.inSightDist) return false;
    let heading = actor.speed.clone().normalize();
    let difference = targetcenterPos.sub(centerPos);
    let dotProd = difference.dot(heading);
    if (dotProd < 0) return false;
    return true
  }

    /**
     * 是否靠太近
     * @param {SteeredActor} vehicle 
     * @returns boolen
     */
    tooClose(actor, vehicle) {
        let centerPos = new Vector(actor.x, actor.y);
        let targetcenterPos = new Vector(vehicle.x, vehicle.y);
        return centerPos.dist(targetcenterPos) < this.tooCloseDist;
    }
}