//////////////////////////////////////////////////////////////////////

window.onload = function () {
    "use strict";

    (function () {
        var screenDiv,
            canvas,
            context,
            loader,
            Startup = {

                init: function () {
                    screenDiv = document.getElementById("screen");
                    canvas = document.getElementById("myCanvas");
                    context = canvas.getContext('2d');
                    loader = new chs.Loader('img/');
                    chs.Debug.init(context, chs.Font.load("Fixedsys", loader));
                    loader.start(Startup.start);
                },

                start: function () {
                    chs.Mouse.init(canvas, screenDiv);
                    chs.Keyboard.init();
                    chs.Timer.init();
                    chs.desktop = new chs.Panel(0, 0, canvas.width, canvas.height, "rgb(32, 128, 48)");
                    if (typeof window.main === "function") {
                        window.main(chs.desktop);
                    }
                    Startup.run();
                },

                run: function () {
                    chs.Timer.update();
                    chs.Keyboard.update();
                    chs.Mouse.update(chs.desktop);
                    chs.desktop.update(chs.Timer.delta);
                    chs.desktop.draw(context, chs.Matrix.identity());
                    chs.Debug.draw();
                    requestAnimFrame(Startup.run);
                }
            };

        return Startup;

    }()).init();
};
