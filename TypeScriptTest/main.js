//////////////////////////////////////////////////////////////////////

window.onload = function () {
    "use strict";

    //window.fbAsyncInit();
    (function () {
        var screenDiv,
            canvas,
            context,
            loader,
            root,
            Main = {

                init: function () {
                    screenDiv = document.getElementById("screen");
                    canvas = document.getElementById("myCanvas");
                    context = canvas.getContext('2d');
                    chs.Mouse.init(canvas, screenDiv);
                    chs.Keyboard.init();
                    chs.Timer.init();
                    loader = new chs.Loader('img/');
                    chs.Debug.init(context, chs.Font.load("Fixedsys", loader));
                    Dictionary.init(loader.load("dictionary.json"));
                    root = new chs.Panel(0, 0, canvas.width, canvas.height, "rgb(32, 128, 48)");
                    root.addChild(new Game(loader));
                    loader.start(context, Main.loaded);
                },

                loaded: function () {
                    root.loaded();
                    Main.run();
                },

                run: function () {
                    chs.Timer.update();
                    chs.Keyboard.update();
                    chs.Mouse.update();
                    root.update(chs.Timer.delta);
                    root.draw(context, chs.Matrix.identity());
                    chs.Debug.draw();
                    requestAnimFrame(Main.run);
                }
            };

        return Main;

    }()).init();
};
