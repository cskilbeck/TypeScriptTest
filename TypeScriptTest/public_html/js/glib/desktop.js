(function () {
    "use strict";

    var canvas,
        element,
        loader,
        context,
        identityMatrix = new glib.Matrix();

    var centerCanvas = function() {
        element.style.position = "absolute";
        element.style.margin = "0px";
        element.style.padding = "0px";
        element.style.left = "0px";
        element.style.top = "0px";
        element.style.width = window.innerWidth + "px";
        element.style.height = window.innerHeight + "px";
        canvas.style.top = Math.floor((element.clientHeight - canvas.height) / 2) + "px";
        canvas.style.left = Math.floor((element.clientWidth - canvas.width) / 2) + "px";
    };

    // Options:
    // autocenter: boolean (defaults to false) - window resize will cause the canvas to be recentered in it's DOMContainer
    // width: int (defaults to 640) - width of the canvas in pixels
    // height: int (defaults to 480) - height of the canvas in pixels
    // backgroundColour: string (defaults to "black") - what the canvas is cleared to at the start of each frame
    // frameRate: int (defaults to 60) - desired FPS
    //

    glib.Desktop = glib.Class({ inherit$: glib.Panel,

        $: function (width, height, color, DOMContainer, options)
        {
            glib.Panel.call(this, 0, 0, width, height, color);
            element = DOMContainer || document.body;
            canvas = document.createElement("canvas");
            canvas.width = this.width;
            canvas.height = this.height;
            canvas.style.position = "absolute";
            centerCanvas();
            window.addEventListener("resize", centerCanvas, false);
            element.appendChild(canvas);
            context = canvas.getContext("2d");
            this.canvas = canvas;
            loader = new glib.Loader('img/');
            glib.Debug.init(context, glib.Font.load("Fixedsys", loader));
            loader.addEventHandler("complete", this.start, this);
            loader.start();
        },

        start: function() {
            glib.Mouse.init(canvas);
            glib.Keyboard.init();
            glib.Timer.init();
            this.run();
        },

        run: function() {
            glib.Timer.update();
            glib.Keyboard.update(this);
            glib.Mouse.update(this);
            this.update(glib.Timer.time, glib.Timer.delta);
            this.draw(context, identityMatrix, 255);
            // glib.Canvas.showCache();
            // mtw.WordButton.showCache();
            glib.Debug.draw();
            requestAnimationFrame(this.run.bind(this));
        },

        width: glib.Property({
            get: function() {
                return this.drawableData.dimensions.width;
            },
            set: function(w) {
                this.drawableData.dimensions.width = w;
                this.drawableData.dirty = true;
                canvas.width = w;
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
                canvas.height = h;
                centerCanvas();
            }
        }),

        clear: function() {
            context.clearRect(0, 0, this.width, this.height);
        }
    });

} ());
