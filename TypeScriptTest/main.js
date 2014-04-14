//////////////////////////////////////////////////////////////////////

var Main = (function () {
    "use strict";

    var screenDiv,
        canvas,
        context,
        loader,
        root,

        Main = {

            init: function (canvasElement, screenDivElement) {
                screenDiv = screenDivElement;
                canvas = canvasElement;
                context = canvas.getContext('2d');
                Mouse.init(canvas, screenDiv);
                Keyboard.init();
                Timer.init();
                loader = new Loader('img/');
                Debug.init(context, Font.load("Fixedsys", loader));

                Dictionary.init(loader.load("dictionary.json"));
                root = new Drawable();
                root.addChild(new Game(loader));

                loader.start();
                Main.load();
            },

            load: function () {
                if (!loader.complete()) {
                    Util.clearContext(context, 32, 128, 64);
                    loader.status(context, 50, 50);
                    requestAnimFrame(Main.load);
                } else {
                    loader = null;
                    root.loaded();
                    Main.run();
                }
            },

            run: function () {
                Timer.update();
                Keyboard.update();
                Mouse.update();
                Util.clearContext(context, 32, 128, 64);
                root.update(Timer.delta);
                root.draw(context, Matrix.identity());
                Debug.draw();
                requestAnimFrame(Main.run);
            }
        };

    return Main;

}());

//////////////////////////////////////////////////////////////////////

window.onload = function () {
    "use strict";

    //window.fbAsyncInit();
    Main.init(document.getElementById("myCanvas"), document.getElementById("screen"));
};
