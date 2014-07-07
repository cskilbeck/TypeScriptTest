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

    glib.Desktop = glib.Class({ inherit$: glib.Panel,

        $: function (width, height, color)
        {
            glib.Panel.call(this, 0, 0, width, height, color);
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

        width: glib.Property({
            get: function() {
                return this.drawableData.dimensions.width;
            },
            set: function(w) {
                this.drawableData.dimensions.width = w;
                this.drawableData.dirty = true;
                this.canvas.width = w;
                centerCanvas();
            }
        }),

        height: glib.Property({
            get: function() {
                return this.drawableData.dimensions.height;
            },
            set: function(h) {
                this.drawableData.dimensions.height = h;
                this.drawableData.dirty = true;
                this.canvas.height = h;
                centerCanvas();
            }
        }),

        clear: function() {
            this.context.clearRect(0, 0, this.width, this.height);
        }
    });

} ());
