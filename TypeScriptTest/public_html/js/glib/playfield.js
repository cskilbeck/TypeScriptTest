(function () {
    "use strict";

    var playfield,
        canvas,
        element,
        loader,
        context,
        autoCenter,
        identityMatrix = new glib.Matrix(),

        centerCanvas = function() {
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
    // autoCenter: boolean (defaults to false) - window resize will cause the canvas to be recentered in it's DOMContainer
    // width: int (defaults to 640) - width of the canvas in pixels
    // height: int (defaults to 480) - height of the canvas in pixels
    // backgroundColour: string (defaults to "black") - what the canvas is cleared to at the start of each frame
    // DOMContainer: object - which HTML Element the canvas should be inserted into
    // NoDebug: boolean (defaults to false) - don't attempt to load img/Fixedsys font

    glib.Playfield = glib.Class({ inherit$: glib.Panel,

        $: function (options) {
            var opt = options || {},
                width = opt.width || 640,
                height = opt.height || 480,
                color = opt.backgroundColour || "black";
            element = opt.DOMContainer || document.body;
            autoCenter = opt.autoCenter || false;   // redundant, kinda
            playfield = this;
            glib.Panel.call(this, 0, 0, width, height, color);
            canvas = document.createElement("canvas");
            canvas.width = this.width;
            canvas.height = this.height;
            canvas.style.position = "absolute";
            if (autoCenter) {
                centerCanvas();
                window.addEventListener("resize", centerCanvas, false);
            }
            element.appendChild(canvas);
            context = canvas.getContext("2d");
            if (opt.NoDebug) {
                update();
            } else {
                loader = new glib.Loader('img/');
                glib.Debug.init(context, glib.Font.load("Fixedsys", loader));
                loader.addEventHandler("complete", function() {
                    glib.Mouse.init(canvas);
                    glib.Keyboard.init();
                    glib.Timer.init();
                    update();
                }).start();
            }
        }
    });

} ());
