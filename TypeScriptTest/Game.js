//////////////////////////////////////////////////////////////////////
// UIElement stack
// TextButton
// TextBox
// Undo/Redo
// Scoreboard
// Title screen
// Mobile: Android/Chrome, iOS/Safari, Windows Phone: IE
// Variable viewport size
// Fix tile grabbing/moving
// Tile lerping
// Flying scores/fizz/particles
// Facebook OAuth
// Leaderboards
// Font: alignment, embedded control characters, links
//
// timer.js
// playfield.js ?
// drawing.js ?
//

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

            time: function () {
                return currentTime;
            },

            deltaTime: function () {
                return deltaTime;
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
                Mouse.init(canvas, screen);
                Keyboard.init();
                loader = new Loader('img/');
                Dictionary.load(loader);
                Debug.init(context, loader);
                buttons = new ButtonList();
                buttons.add(new Button("undo", loader, 710, 200, Board.undo));
                buttons.add(new Button("redo", loader, 760, 200, Board.redo));
                Tile.load(loader);
                loader.start();
                Game.load();
            },

            load: function () {
                if (loader.loadingComplete()) {
                    //requestAnimFrame(Game.load);
                    loader = null;
                    Board.randomize(1);
                    Game.run();
                } else {
                    Game.cls();
                    context.fillStyle = 'white';
                    context.font = "20px Arial";
                    context.fontBaseLine = 'top';
                    context.fillText("Loading...", 50, 30);
                    loader.status(context, 50, 100);
                    context.strokeStyle = 'white';
                    context.lineWidth = 1;
                    context.fillStyle = 'black';
                    context.strokeRect(50, 75, 400, 20);
                    context.fillRect(51, 76, loader.percentComplete() * 398 / 400, 18);
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
            }
        };

    return Game;

}());

