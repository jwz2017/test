var fps = document.createElement("span");
var fpsE;
fps.style.color = "#ff0";
fps.style.font = "20px Arial";
fps.style.position = "absolute";
fps.style.top = "8px";
fps.style.left="10px";
export var Fps = {
    start: function () {
        containerDiv.appendChild(fps);
        fpsE = createjs.Ticker.on("tick", () => {
            fps.innerHTML = Math.round(createjs.Ticker.getMeasuredFPS()) + "fps";
        });
    },
    stop: function () {
        containerDiv.removeChild(fps);
        createjs.Ticker.off("tick", fpsE);
    }
}