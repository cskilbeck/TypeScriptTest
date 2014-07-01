//////////////////////////////////////////////////////////////////////

window.onload = function () {
    "use strict";

    var identityMatrix = new chs.Matrix(),

        startup = chs.Class({

        static$: {

            init: function () {
                var loader;
                chs.desktop = new chs.Desktop(852, 480, "rgb(32, 128, 48)");
                loader = new chs.Loader('img/');
                chs.Debug.init(chs.desktop.context, chs.Font.load("Fixedsys", loader));
                loader.addEventHandler("complete", startup.start);
                loader.start();
            },

            start: function () {
                chs.Mouse.init(chs.desktop.canvas);
                chs.Keyboard.init();
                chs.Timer.init();
                if (typeof window.main === "function") {
                    window.main(chs.desktop);
                }
                startup.run();
            },

            run: function () {
                chs.Timer.update();
                chs.Keyboard.update(chs.desktop);
                chs.Mouse.update(chs.desktop);
                chs.desktop.update(chs.Timer.time, chs.Timer.delta);
                chs.desktop.draw(chs.desktop.context, identityMatrix, 255);
                // chs.Canvas.showCache();
                // mtw.WordButton.showCache();
                chs.Debug.draw();
                requestAnimationFrame(startup.run);
            }
        }
    });

    startup.init();
};
