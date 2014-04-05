//////////////////////////////////////////////////////////////////////
// Fix tile grabbing/moving
// Tile lerping
// Undo/Redo
// Scoreboard
// Flying scores
// Title screen
// Leaderboard
// Facebook OAuth
// Button
// TextBox

var Game = (function () {
    "use strict";

    var currentTime = window.performance.now(),
        deltaTime,
        frames = 0,
        screen,
        canvas,
        context,
        buttons,

        Game = {

            onUndo: function () {
                console.log("Undo!");
            },

            onRedo: function () {
                console.log("Redo!");
            },

            cls: function () {
                context.setTransform(1, 0, 0, 1, 0, 0);
                context.globalCompositeOperation = 'source-over';
                context.globalAlpha = 1;
                context.fillStyle = 'rgb(64, 128, 64)';
                context.fillRect(0, 0, 800, 600);
            },

            init: function (canvasElement, screenDivElement) {
                screen = screenDivElement;
                canvas = canvasElement;
                context = canvas.getContext('2d');
                Debug.context = context;
                Mouse.init(canvas, screen);
                Keyboard.init();
                buttons = new ButtonList();
                buttons.add(new Button(ImageLoader.load("undo"), 710, 200, Game.onUndo));
                buttons.add(new Button(ImageLoader.load("redo"), 760, 200, Game.onRedo));
                Game.load();
            },

            load: function () {
                if (ImageLoader.complete() && Dictionary.isLoaded()) {
                    Game.postLoad();
                } else {
                    Game.cls();
                    context.fillStyle = 'white';
                    context.fillRect(10, 10, 200, 200); // loader progress bar here...
                    requestAnimFrame(Game.load);
                }
            },

            postLoad: function () {
                Board.randomize(1);
                Game.onFrame();
            },

            onFrame: function () {
                var now = window.performance.now();
                deltaTime = now - currentTime;
                currentTime = now;
                Keyboard.update();
                Mouse.update();
                Game.cls();
                Board.update(deltaTime);
                buttons.update();
                Board.draw(context);
                buttons.draw(context);
                Debug.draw();
                frames += 1;
                requestAnimFrame(Game.onFrame);
            },

            time: function () {
                return currentTime;
            },

            deltaTime: function () {
                return deltaTime;
            }
        };

    return Game;

}());

