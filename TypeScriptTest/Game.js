﻿//////////////////////////////////////////////////////////////////////
// list.sort is not stable - why?
// Undo/Redo/SaveBest
// Title screen
// Mobile: Android/Chrome, iOS/Safari, Windows Phone: IE // Touch Support
// Drawable clipping rects
// Fix tile grabbing/moving/swapping/lerping
// Flying scores/fizz/particles
// OAuth/AWS/Leaderboards
// Font: embedded control characters, links
// Drawable: TextBox (scrollable, links, stack etc)

//////////////////////////////////////////////////////////////////////

var Game = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var consolas,
        arial,
        words,
        wordButton,
        score,
        button,
        board,

    //////////////////////////////////////////////////////////////////////

        Game = function (loader) {
            Drawable.call(this);
            wordButton = loader.load("wordbutton.png");
            consolas = Font.load("Consolas", loader);
            arial = Font.load("Arial", loader);

            board = new Board(loader);
            this.addChild(board);

            score = new Label("Score: 0", consolas).setPivot(0, 0).setPosition(690, 11);
            this.addChild(score);

            this.addChild(new SpriteButton(loader.load("undo.png"), "scale", 600, 500, this.undo, null));
            this.addChild(new SpriteButton(loader.load("redo.png"), "scale", 640, 500, this.redo, null));

            words = new Drawable();
            this.addChild(words);
        };

    //////////////////////////////////////////////////////////////////////

    Game.prototype = {

        //////////////////////////////////////////////////////////////////////

        onLoaded: function () {
            board.randomize(1);
        },

        //////////////////////////////////////////////////////////////////////

        undo: function () {

        },

        //////////////////////////////////////////////////////////////////////

        redo: function () {

        },

        //////////////////////////////////////////////////////////////////////

        onUpdate: function (deltaTime) {
            var y = 50;
            if (board.changed) {
                words.children.clear();
                board.wordList().forEach(function (w) {
                    button = new SpriteButton(wordButton, "scale", 736, y, function () {
                        var def = consolas.wrapText(Dictionary.getDefinition(w.str), 600, '\n    '),
                            panel = new PanelButton(80, 60, 640, 480, 'black', function () {
                                this.close();
                            }).setPivot(0, 0);
                        panel.transparency = 192;
                        panel.addChild(new Label(def, consolas).setPosition(8, 36).setPivot(0, 0));
                        panel.addChild(new Label(w.str.toUpperCase(), arial).setPosition(8, 8).setPivot(0, 0).setScale(0.5));
                        panel.zIndex = 1;
                        panel.modal = true;
                        this.addSibling(panel);
                    }, null, this);
                    button.addChild(new Label(w.str, consolas).setPosition(-56, 1).setPivot(0, 0.5));
                    button.addChild(new Label(w.score.toString(), consolas).setPosition(56, 1).setPivot(1, 0.5));
                    button.word = w;
                    y += button.height() + 2;
                    words.addChild(button);
                }, this);
                board.changed = false;
                score.text = "Score: " + board.score.toString();
            }
        }

    };

    return Game.extend(Drawable);

}());
