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
        board,
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
                board = new Board();
                board.randomize(1);
                buttons = new ButtonList();
                buttons.add(new Button(ImageLoader.load("undo"), 710, 200, Game.onUndo));
                buttons.add(new Button(ImageLoader.load("redo"), 760, 200, Game.onRedo));
            },

            run: function () {
                var now;
                if (ImageLoader.complete() && Dictionary.isLoaded()) {
                    requestAnimFrame(Game.onFrame);
                } else {
                    Game.cls();
                    context.fillStyle = 'white';
                    context.fillText(10, 10, "Loading");
                    requestAnimFrame(Game.run);
                }
            },

            onFrame: function() {
                var now = window.performance.now();
                deltaTime = now - currentTime;
                currentTime = now;
                Keyboard.update();
                Mouse.update();
                Game.cls();
                board.update(deltaTime);
                buttons.update();
                buttons.draw(context);
                board.draw(context);
                Debug.draw();
                frames += 1;
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

