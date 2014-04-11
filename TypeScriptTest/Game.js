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
// Font: alignment, embedded control characters, links
// Drawable: Panel
// Drawable: TextBox
// 
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
        consolas,
        label,
        words,
        wordButton,
        score,

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
                Tile.load(loader);
                Debug.init(context, Font.load("Fixedsys", loader));
                wordButton = loader.load("wordbutton.png");
                consolas = Font.load("Consolas", loader);

                score = new Label("Score: 0", consolas);
                score.setPivot(0.5, 0);
                score.setPosition(730, 11);

                words = new ButtonList();

                buttons = new ButtonList();
                buttons.add(new SpriteButton(loader.load("undo.png"), "scale", 600, 500, Board.undo, null));
                buttons.add(new SpriteButton(loader.load("redo.png"), "scale", 640, 500, Board.redo, null));
                buttons.add(new TextButton("HELLO", font, 720, 500).setScale(0.5));

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
                    button,
                    y;
                deltaTime = now - currentTime;
                currentTime = now;
                Keyboard.update();
                Mouse.update();
                Game.cls();

                buttons.update(deltaTime);
                Board.update(deltaTime);

                if (Board.changed) {
                    words = new ButtonList();
                    y = 50;
                    Board.wordList().forEach(function (w) {
                        button = new SpriteButton(wordButton, "scale", 736, y, Board.undo);
                        button.addChild(new Label(w.str, consolas).setPosition(-56, 1).setPivot(0, 0.5));
                        button.addChild(new Label(w.score.toString(), consolas).setPosition(56, 1).setPivot(1, 0.5));
                        y += button.height() + 2;
                        words.add(button);
                    });
                    Board.changed = false;
                    score.text = "Score: " + Board.score.toString();
                }

                words.update(deltaTime);

                words.draw(context);
                Board.draw(context);
                buttons.draw(context);
                score.draw(context);

                Debug.draw();
                frames += 1;
                requestAnimFrame(Game.run);
            }
        };

    return Game;

}());

