//////////////////////////////////////////////////////////////////////

window.onload = function () {
    "use strict";

    var identityMatrix = new glib.Matrix(),

        startup = glib.Class({

        static$: {

            init: function () {
                var loader;
                glib.desktop = new glib.Desktop(852, 480, "rgb(32, 128, 48)");
                loader = new glib.Loader('img/');
                glib.Debug.init(glib.desktop.context, glib.Font.load("Fixedsys", loader));
                loader.addEventHandler("complete", startup.start);
                loader.start();
            },

            start: function () {
                glib.Mouse.init(glib.desktop.canvas);
                glib.Keyboard.init();
                glib.Timer.init();
                if (typeof window.main === "function") {
                    window.main(glib.desktop);
                }
                startup.run();
            },

            run: function () {
                glib.Timer.update();
                glib.Keyboard.update(glib.desktop);
                glib.Mouse.update(glib.desktop);
                glib.desktop.update(glib.Timer.time, glib.Timer.delta);
                glib.desktop.draw(glib.desktop.context, identityMatrix, 255);
                // glib.Canvas.showCache();
                // mtw.WordButton.showCache();
                glib.Debug.draw();
                requestAnimationFrame(startup.run);
            }
        }
    });

    startup.init();
};
