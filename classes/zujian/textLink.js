export class TextLink extends createjs.Text {
    constructor(text,font,color,hoverColor) {
        super(text,font,color);
        this.hoverColor=hoverColor;
        this.hitArea=new createjs.Shape();
        this.hover=false;
        this.hitArea.graphics.clear().beginFill("#fff").drawRect(0, 0, this.getMeasuredWidth(), this.getMeasuredHeight());

        this.addEventListener("rollover",this);
        this.addEventListener("rollout",this)
    }
    draw(ctx,ignoreCache){
        let color=this.color;
        if(this.hover) this.color=this.hoverColor;

        super.draw(ctx,ignoreCache);

        this.color=color;
    }

    handleEvent(e){
        this.hover=(e.type=="rollover");
        
    }
}