//////////////////////////////////////////////////////////////////////
// list.sort is not stable - why?
// UIElement stack
// TextButton
// TextBox
// Undo/Redo/SaveBest
// Scoreboard
// Title screen
// Mobile: Android/Chrome, iOS/Safari, Windows Phone: IE // Touch Support
// Variable viewport size
// Fix tile grabbing/moving/swapping
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
        font,

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
                font = Font.load("Arial", loader);
                Dictionary.init(loader.load("dictionary.json"));
                Debug.init(context, Font.load("Fixedsys", loader));
                buttons = new ButtonList();
                buttons.add(new Button(loader.load("undo.png"), 710, 200, Board.undo));
                buttons.add(new Button(loader.load("redo.png"), 760, 200, Board.redo));
                Tile.load(loader);
                loader.start();
                Game.load();
            },

            load: function () {
                if (!loader.loadingComplete()) {
                    Game.cls();
                    loader.status(context, 50, 50);
                    requestAnimFrame(Game.load);
                } else {
                    loader = null;
                    Board.randomize(1);
                    Game.run();
                }
            },

            run: function () {
                var now = window.performance.now(),
                    s = Math.sin(Game.time() / 1000) * 0.5 + 1;
                deltaTime = now - currentTime;
                currentTime = now;
                Keyboard.update();
                Mouse.update();
                Game.cls();
                Board.update(deltaTime);
                buttons.update();
                Board.draw(context);
                buttons.draw(context);
                font.drawText(context, "HELLO", { x: 400, y: 300 }, Game.time() / 1000, { x: s, y: s }, Font.center, Font.middle);
                Debug.draw();
                frames += 1;
                requestAnimFrame(Game.run);
            }
        };

    return Game;

}());

