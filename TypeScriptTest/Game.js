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

    var frames = 0,
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

            init: function (canvasElement, screenDivElement) {

                screen = screenDivElement;
                canvas = canvasElement;
                context = canvas.getContext('2d');

                Mouse.init(canvas, screen);
                Keyboard.init();
                Timer.init();
                loader = new Loader('img/');
                Debug.init(context, Font.load("Fixedsys", loader));

                font = Font.load("Arial", loader);
                Dictionary.init(loader.load("dictionary.json"));
                Tile.load(loader);
                wordButton = loader.load("wordbutton.png");
                consolas = Font.load("Consolas", loader);
                score = new Label("Score: 0", consolas);
                score.setPivot(0.5, 0);
                score.setPosition(730, 11);
                words = new Drawable();
                buttons = new Drawable();
                buttons.addChild(new SpriteButton(loader.load("undo.png"), "scale", 600, 500, Board.undo, null));
                buttons.addChild(new SpriteButton(loader.load("redo.png"), "scale", 640, 500, Board.redo, null));
                buttons.addChild(new TextButton("HELLO", font, 720, 500).setScale(0.5));

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
                    Board.randomize(1);
                    Game.run();
                }
            },

            run: function () {
                var button,
                    y;
                Timer.update();
                Keyboard.update();
                Mouse.update();
                Util.clearContext(context, 32, 128, 64);

                buttons.update(Timer.delta);
                Board.update(Timer.delta);

                if (Board.changed) {
                    words = new Drawable();
                    y = 50;
                    Board.wordList().forEach(function (w) {
                        button = new SpriteButton(wordButton, "scale", 736, y, Game.showDefinition);
                        button.addChild(new Label(w.str, consolas).setPosition(-56, 1).setPivot(0, 0.5));
                        button.addChild(new Label(w.score.toString(), consolas).setPosition(56, 1).setPivot(1, 0.5));
                        button.word = w;
                        y += button.height() + 2;
                        words.addChild(button);
                    });
                    Board.changed = false;
                    score.text = "Score: " + Board.score.toString();
                }

                words.update(Timer.delta);

                words.draw(context);
                Board.draw(context);
                buttons.draw(context);
                score.draw(context);

                buttons.children.removeIf(function (b) {
                    return b.removeThis;
                });

                Debug.draw();
                frames += 1;
                requestAnimFrame(Game.run);
            },

            definitionClicked: function () {
                this.removeThis = true;
            },

            showDefinition: function () {
                var panel = new PanelButton(400, 300, 640, 480, 'black', Game.definitionClicked);
                panel.transparency = 192;
                buttons.addChild(panel);
            }
        };

    return Game;

}());

