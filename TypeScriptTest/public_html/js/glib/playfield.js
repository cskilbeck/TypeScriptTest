(function () {
    "use strict";

    var playfield,
        canvas,
        element,
        loader,
        context,
        identityMatrix = new glib.Matrix(),

        centerCanvas = function() {
            element.style.position = "absolute";
            element.style.margin = "0px";
            element.style.padding = "0px";
            element.style.left = "0px";
            element.style.top = "0px";
            element.style.width = window.innerWidth + "px";
            element.style.height = window.innerHeight + "px";
            canvas.style.top = Math.floor((element.clientHeight - canvas.height) / 2) + "px";
            canvas.style.left = Math.floor((element.clientWidth - canvas.width) / 2) + "px";
        },

        update = function() {
            glib.Timer.update();
            glib.Keyboard.update(playfield);
            glib.Mouse.update(playfield);
            playfield.update(glib.Timer.time, glib.Timer.delta);
            playfield.draw(context, identityMatrix, 255);
            glib.Debug.draw();
            requestAnimationFrame(update);
        };

    // Options:
    // autocenter: boolean (defaults to false) - window resize will cause the canvas to be recentered in it's DOMContainer
    // width: int (defaults to 640) - width of the canvas in pixels
    // height: int (defaults to 480) - height of the canvas in pixels
    // backgroundColour: string (defaults to "black") - what the canvas is cleared to at the start of each frame
    // frameRate: int (defaults to 60) - desired FPS
    // DOMContainer: object - which HTML Element the canvas should be inserted into

    glib.Playfield = glib.Class({ inherit$: glib.Panel,

        $: function (width, height, color, options)
        {
            if (playfield === undefined) {
                playfield = this;
                glib.Panel.call(this, 0, 0, width, height, color);
                element = options !== undefined ? (options.DOMContainer || document.body) : document.body;
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
                loader.addEventHandler("complete", function() {
                    glib.Mouse.init(canvas);
                    glib.Keyboard.init();
                    glib.Timer.init();
                    update();
                }, this);
                loader.start();
            }
        }
    });

} ());
