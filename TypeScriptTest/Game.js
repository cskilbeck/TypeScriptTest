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
        loader,

        Game = {

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
                loader = new Loader();
                Dictionary.load(loader);
                Debug.init(context, loader);
                buttons = new ButtonList();
                buttons.add(new Button("undo", loader, 710, 200, Board.undo));
                buttons.add(new Button("redo", loader, 760, 200, Board.redo));
                buttons.head().setFlip(false, true);
                Tile.load(loader);
                loader.start();
                Game.load();
            },

            load: function () {
                if (loader.loadingComplete()) {
                    loader = null;
                    Mouse.init(canvas, screen);
                    Keyboard.init();
                    Board.randomize(1);
                    Game.run();
                } else {
                    Game.cls();
                    context.fillStyle = 'white';
                    context.font = "20px Arial";
                    context.fillText("Loading...", 50, 50);
                    context.fillStyle = 'black';
                    context.fillRect(50, 200, 400, 20);
                    context.fillStyle = 'green';
                    context.fillRect(50, 200, loader.percentComplete() * 4, 20);
                    requestAnimFrame(Game.load);
                }
            },

            run: function () {
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
                requestAnimFrame(Game.run);
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

