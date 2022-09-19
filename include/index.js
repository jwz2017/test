window.onload = function () {
    "use strict";
    /*************游戏入口*****/
    var g = new GFrame('canvas');
    g.adapt();
    // var loader = new createjs.FontLoader({
    //     src: ["assets/fonts/regul-book.woff",
    //         "assets/fonts/regul-bold.woff"
    //     ],
    //     type:"font"
    // });
    // loader.load();
    var close = document.getElementById("close");
    model.addEventListener(GFrame.event.LOADER_COMPLETE, () => {
        close.style.display = "block";
        // if (!g.fps) {
        //     g.startFPS();
        // }
    })
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
        // console.log(this);
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
        let container = document.getElementById("container");
        container.style.display = "block";
        close.style.display = "none";
        //禁止滚动
        document.getElementsByTagName('body')[0].setAttribute('style', 'position:fixed; width:100%;');
        g.preload(eval(a.title));
        // if(!g.fps)g.startFPS();
    }
    //关闭按钮点击
    close.onclick = function (e) {
        let a = e.target;
        a.parentNode.style.display = "none";
        stage.removeAllEventListeners();
        stage.removeAllChildren();
        g.game.clear();
        //应许滚动
        document.getElementsByTagName('body')[0].setAttribute('style', 'position:relative;');
    }


}