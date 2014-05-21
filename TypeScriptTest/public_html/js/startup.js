//////////////////////////////////////////////////////////////////////

window.onload = function () {
    "use strict";

    var startup = chs.Class({

        static$: {

            init: function () {
                var loader;
                chs.desktop = new chs.Desktop();
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
                chs.Keyboard.update();
                chs.Mouse.update(chs.desktop);
                chs.desktop.update(chs.Timer.time, chs.Timer.delta);
                chs.desktop.draw(chs.desktop.context, chs.Matrix.identity(), 255);
                chs.Canvas.showCache();
                chs.Debug.draw();
                requestAnimationFrame(startup.run);
            }
        }
    });

    startup.init();
};
