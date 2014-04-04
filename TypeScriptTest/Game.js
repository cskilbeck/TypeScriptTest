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

                var now = window.performance.now(),
                    deltaTime = now - currentTime;
                currentTime = now;

                Keyboard.update();
                Mouse.update();
                board.update(deltaTime);
                buttons.update();

                Game.cls();

                buttons.draw(context);
                board.draw(context);

                Debug.draw();

                frames += 1;
                requestAnimFrame(Game.run);
            },

            currentTime: function () {
                return currentTime;
            }
        };

    return Game;

}());

