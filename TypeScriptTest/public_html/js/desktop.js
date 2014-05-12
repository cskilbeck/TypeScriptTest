(function () {
    "use strict";

    var canvas;

    function centerCanvas() {
        document.body.style.position = "absolute";
        document.body.style.margin = "0px";
        document.body.style.padding = "0px";
        document.body.style.left = "0px";
        document.body.style.top = "0px";
        document.body.style.width = window.innerWidth + "px";
        document.body.style.height = window.innerHeight + "px";
        canvas.style.top = (document.body.clientHeight - canvas.height) / 2 + "px";
        canvas.style.left = (document.body.clientWidth - canvas.width) / 2 + "px";
    }

    chs.Desktop = chs.Class({
        inherit$: [chs.Panel],

        $: function ()
        {
            var windowWidth = window.innerWidth,
                windowHeight = window.innerHeight,
                aspectRatio = windowWidth / windowHeight;
            if(windowWidth > 852) {
                windowWidth = 852;
                windowHeight = windowWidth / aspectRatio;
            }
            if(windowHeight < 480) {
                windowHeight = 480;
                windowWidth = windowHeight * aspectRatio;
            }
            chs.Panel.call(this, 0, 0, windowWidth, windowHeight, "rgb(32, 128, 48)");
            canvas = document.createElement("canvas");
            canvas.width = this.width;
            canvas.height = this.height;
            canvas.style.position = "absolute";
            centerCanvas();
            window.onresize = centerCanvas;
            document.body.appendChild(canvas);
            this.context = canvas.getContext("2d");
            this.canvas = canvas;
        },
    });

} ());
