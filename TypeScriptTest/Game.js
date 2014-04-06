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
                loader = new Loader();
                Debug.init(context, loader);
                buttons = new ButtonList();
                buttons.add(new Button("undo", loader, 710, 200, Game.onUndo));
                buttons.add(new Button("redo", loader, 760, 200, Game.onRedo));
                Dictionary.load(loader);
                Tile.load(loader);
                Game.waitForLoader();
            },

            waitForLoader: function () {
                if (loader.complete()) {
                    Game.onLoaded();
                } else {
                    Game.cls();
                    context.fillStyle = 'white';
                    context.font = "20px Arial";
                    context.fillText("Loaded " + loader.bytesReceived.toString() + " bytes...", 50, 50);
                    requestAnimFrame(Game.waitForLoader);
                }
            },

            onLoaded: function () {
                Mouse.init(canvas, screen);
                Keyboard.init();
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

