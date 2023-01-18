class Point3D{
        constructor(x=0,y=0,z=0){
            this.fl=250;
            this._vpX=0;
            this._vpY=0;
            this._cX=0;
            this._cY=0;
            this._cZ=0;
            this.x=x;
            this.y=y;
            this.z=z;
        }
        setVanishingPoint(vpX,vpY){
            this._vpX=vpX;
            this._vpY=vpY;
        }
        setCenter(cX,cY,cZ=0){
            this._cX=cX;
            this._cY=cY;
            this._cZ=cZ;
        }
        get screenX(){
            let scale=this.fl/(this.fl+this.z+this._cZ);
            return this._vpX+this._cX+this.x*scale;
        }
        get screenY(){
            let scale=this.fl/(this.fl+this.z+this._cZ);
            return this._vpY+this._cY+this.y*scale;
        }
        rotateX(angleX){
            let cosX=Math.cos(angleX),
            sinX=Math.sin(angleX),
            y1=this.y*cosX-this.z*sinX,
            z1=this.z*cosX+this.y*sinX;
            this.y=y1;
            this.z=z1;
        }
        rotateY(angleY){
            let cosY=Math.cos(angleY),
            sinY=Math.sin(angleY),
            x1=this.x*cosY-this.z*sinY,
            z1=this.z*cosY+this.x*sinY;
            this.x=x1;
            this.z=z1;
        }
        rotateZ(angleZ){
            let cosZ=Math.cos(angleZ),
            sinZ=Math.sin(angleZ),
            x1=this.x*cosZ-this.y*sinZ,
            y1=this.y*cosZ+this.x*sinZ;
            this.x=x1;
            this.y=y1;
        }

    }
class Triangle{
        constructor(a,b,c,color){
            this._pointA=a;
            this._pointB=b;
            this._pointC=c;
            this._color=color;
        }
        draw(g){
            if (this._isBackFace()) {
                return;
            }
            g.beginStroke(this.getAdjustedColor());
            g.beginFill(this.getAdjustedColor());
            g.moveTo(this._pointA.screenX,this._pointA.screenY);
            g.lineTo(this._pointB.screenX,this._pointB.screenY);
            g.lineTo(this._pointC.screenX,this._pointC.screenY);
            g.closePath();
            // g.endStroke();
            g.endFill();
        }
        _isBackFace(){
            let cax=this._pointC.screenX-this._pointA.screenX;
            let cay=this._pointC.screenY-this._pointA.screenY;
            let bcx=this._pointB.screenX-this._pointC.screenX;
            let bcy=this._pointB.screenY-this._pointC.screenY;
            return cax*bcy>cay*bcx;
        }
        getAdjustedColor(){
            let color=utils.parseColor(this._color,true);
            let red=color>>16;
            let green=color>>8&0xff;
            let blue=color&0xff;
            let lightFactor=this._getLightFactor();
            red*=lightFactor;
            green*=lightFactor;
            blue*=lightFactor;
            return utils.parseColor(red<<16|green<<8|blue);
        }
        _getLightFactor(){
            let ab=new Object();
            ab.x=this._pointA.x-this._pointB.x;
            ab.y=this._pointA.y-this._pointB.y;
            ab.z=this._pointA.z-this._pointB.z;
            let bc=new Object();
            bc.x=this._pointB.x-this._pointC.x;
            bc.y=this._pointB.y-this._pointC.y;
            bc.z=this._pointB.z-this._pointC.z;
            let norm=new Object();
            norm.x=(ab.y*bc.z)-(ab.z*bc.y);
            norm.y=-((ab.x*bc.z)-(ab.z*bc.x));
            norm.z=(ab.x*bc.y)-(ab.y*bc.x);
            let dotProd=norm.x*this.light.x+norm.y*this.light.y+norm.z*this.light.z;
            let normMag=Math.sqrt(norm.x*norm.x+norm.y*norm.y+norm.z*norm.z);
            let lightMag=Math.sqrt(this.light.x*this.light.x+this.light.y*this.light.y+this.light.z*this.light.z);

            return Math.acos(dotProd/(normMag*lightMag))/Math.PI*this.light.brightness;
        }
        get depth(){
            let zpos=Math.min(this._pointA.z,this._pointB.z);
            zpos=Math.min(zpos,this._pointC.z);
            return zpos;
        }

    }
class Light{
        constructor(x=-100,y=-100,z=-100,brightness=1){
            this.x=x;
            this.y=y;
            this.z=z;
            this.brightness=brightness;
        }
        get brightness(){
            return this._brightness;
        }
        set brightness(b){
            this._brightness=Math.max(b,0);
            this._brightness=Math.min(this._brightness,1);
        }

    }