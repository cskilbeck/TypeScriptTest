//////////////////////////////////////////////////////////////////////
// Fix tile grabbing/moving
// Tile lerping
// Undo/Redo
// Scoreboard
// Flying scores
// Title screen
// Leaderboard
// Facebook OAuth

var Game = (function () {
    "use strict";

    var currentTime = window.performance.now(),
        frames = 0,
        board,
        screen,
        canvas,
        context,

        Game = {

            init: function (canvasName, screenDivName) {
                screen = document.getElementById(screenDivName);
                canvas = document.getElementById(canvasName);
                context = canvas.getContext('2d');
                Debug.context = context;
                Mouse.init(canvas, screen);
                Keyboard.init();
                board = new Board();
                board.randomize(1);
            },

            run: function () {

                var now = window.performance.now(),
                    deltaTime = now - currentTime;

                currentTime = now;

                Keyboard.update();
                Mouse.update();

                context.globalCompositeOperation = 'source-over';
                context.globalAlpha = 1;
                context.fillStyle = 'rgb(64, 128, 64)';
                context.fillRect(0, 0, 800, 600);

                Debug.text(10, 490, Game.currentTime().toFixed(0));

                board.update(deltaTime);
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

