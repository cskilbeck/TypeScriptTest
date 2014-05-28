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
        canvas.style.top = Math.floor((document.body.clientHeight - canvas.height) / 2) + "px";
        canvas.style.left = Math.floor((document.body.clientWidth - canvas.width) / 2) + "px";
    }

    chs.Desktop = chs.Class({ inherit$: chs.Panel,

        $: function ()
        {
            chs.Panel.call(this, 0, 0, 852, 480, "rgb(32, 128, 48)");
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

        clear: function() {
            this.context.clearRect(0, 0, this.width, this.height);
        }
    });

} ());
