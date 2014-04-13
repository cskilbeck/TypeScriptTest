//////////////////////////////////////////////////////////////////////
// list.sort is not stable - why?
// Undo/Redo/SaveBest
// Scoreboard
// Title screen
// Mobile: Android/Chrome, iOS/Safari, Windows Phone: IE // Touch Support
// Variable viewport size
// Fix tile grabbing/moving/swapping
// Tile lerping
// Flying scores/fizz/particles
// Facebook OAuth
// AWS/Leaderboards
// Font: embedded control characters, links
// Drawable: TextBox (scrollable, links, stack etc)
//
//
// timer.js
// playfield.js ?
// drawing.js ?
//

var Game = (function () {
    "use strict";

    var screenDiv,
        canvas,
        context,
        loader,
        root,

        Game = {

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
                root.addChild(new GameScreen(loader));
                loader.start();
                Game.load();
            },

            load: function () {
                if (!loader.loadingComplete()) {
                    Util.clearContext(context, 32, 128, 64);
                    loader.status(context, 50, 50);
                    requestAnimFrame(Game.load);
                } else {
                    loader = null;
                    root.loaded();
                    Game.run();
                }
            },

            run: function () {
                Timer.update();
                Keyboard.update();
                Mouse.update();
                Util.clearContext(context, 32, 128, 64);
                root.update(Timer.delta);
                root.draw(context);
                Debug.draw();
                requestAnimFrame(Game.run);
            }
        };

    return Game;

}());

