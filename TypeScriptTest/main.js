//////////////////////////////////////////////////////////////////////

window.onload = function () {
    "use strict";

    (function () {
        var screenDiv,
            canvas,
            context,
            loader,
            game,
            Main = {

                init: function () {
                    screenDiv = document.getElementById("screen");
                    canvas = document.getElementById("myCanvas");
                    context = canvas.getContext('2d');
                    loader = new chs.Loader('img/');
                    chs.Debug.init(context, chs.Font.load("Fixedsys", loader));
                    loader.start(Main.start);
                },

                start: function () {
                    chs.Mouse.init(canvas, screenDiv);
                    chs.Keyboard.init();
                    chs.Timer.init();
                    chs.desktop = new chs.Panel(0, 0, canvas.width, canvas.height, "rgb(32, 128, 48)");
                    game = new Game(chs.desktop);
                    Main.run();
                },

                run: function () {
                    chs.Timer.update();
                    chs.Keyboard.update();
                    chs.Mouse.update(chs.desktop);
                    chs.desktop.update(chs.Timer.delta);
                    chs.desktop.draw(context, chs.Matrix.identity());
                    chs.Debug.draw();
                    requestAnimFrame(Main.run);
                }
            };

        return Main;

    }()).init();
};
