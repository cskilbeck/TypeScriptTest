//////////////////////////////////////////////////////////////////////

var GameScreen = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var x,
        consolas,
        arial,
        words,
        wordButton,
        score,
        y,
        button,

    //////////////////////////////////////////////////////////////////////

        GameScreen = function (loader) {
            Drawable.call(this);
            Tile.load(loader);
            wordButton = loader.load("wordbutton.png");
            consolas = Font.load("Consolas", loader);
            arial = Font.load("Arial", loader);
            words = new Drawable();
            score = new Label("Score: 0", consolas);
            score.setPivot(0, 0);
            score.setPosition(690, 11);
            this.addChild(score);
            this.addChild(new SpriteButton(loader.load("undo.png"), "scale", 600, 500, this.undo, null));
            this.addChild(new SpriteButton(loader.load("redo.png"), "scale", 640, 500, this.redo, null));
            this.addChild(words);
        };

    //////////////////////////////////////////////////////////////////////

    Util.extendClass(Drawable, GameScreen, {
    
        //////////////////////////////////////////////////////////////////////

        onLoaded: function () {
            Board.randomize(1);
        },

        //////////////////////////////////////////////////////////////////////

        undo: function () {

        },

        //////////////////////////////////////////////////////////////////////

        redo: function () {

        },

        //////////////////////////////////////////////////////////////////////

        onUpdate: function (deltaTime) {
            Board.update(deltaTime);
            if (Board.changed) {
                words.children.clear();
                y = 50;
                Board.wordList().forEach(function (w) {
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
                Board.changed = false;
                score.text = "Score: " + Board.score.toString();
            }
        },

        //////////////////////////////////////////////////////////////////////

        onDraw: function (context) {
            Board.draw(context);
        }

    });

    return GameScreen;

}());