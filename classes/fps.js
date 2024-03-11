var fps = document.createElement("span");
var fpsE;
fps.style.color = "#fff";
fps.style.font = "20px Arial";
fps.style.position = "absolute";
fps.style.top = "8px";
export var Fps = {
    start: function () {
        gameDom.appendChild(fps);
        fpsE = createjs.Ticker.on("tick", () => {
            fps.innerHTML = Math.round(createjs.Ticker.getMeasuredFPS()) + "fps";
        });
    },
    stop: function () {
        gameDom.removeChild(fps);
        createjs.Ticker.off("tick", fpsE);
    }
}