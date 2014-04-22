//////////////////////////////////////////////////////////////////////

window.onload = function () {
    "use strict";

    (function () {
        var screen,
            canvas,
            context,
            loader,
            Startup = {

                init: function () {
                    var pw,
                        ph;
                    window.onresize = function () {
                        pw = screen.clientWidth;
                        ph = screen.clientHeight;
                        canvas.style.top = (ph - canvas.height) / 2 + "px";
                        canvas.style.left = (pw - canvas.width) / 2 + "px";
                    };

                    screen = document.getElementById("screen");
                    canvas = document.getElementById("myCanvas");
                    window.onresize();
                    context = canvas.getContext('2d');
                    loader = new chs.Loader('img/');
                    chs.Debug.init(context, chs.Font.load("Fixedsys", loader));
                    loader.start(Startup.start);
                },

                start: function () {
                    chs.Mouse.init(canvas, screen);
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
                    chs.desktop.update(chs.Timer.time, chs.Timer.delta);
                    chs.desktop.draw(context, chs.Matrix.identity());
                    chs.Debug.draw();
                    requestAnimFrame(Startup.run);
                }
            };

        return Startup;

    }()).init();
};
