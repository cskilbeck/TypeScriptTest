//////////////////////////////////////////////////////////////////////
// Font Layer Mask
// Undo/Redo/Save/Personal Best
// Title screen
// Mobile: Android/Chrome, iOS/Safari, Windows Phone: IE // Touch Support
// Fix tile grabbing/moving/swapping/lerping
// Flying scores/fizz/particles
// OAuth/AWS/Leaderboards
//////////////////////////////////////////////////////////////////////

var Game = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var loader,
        consolas,
        arial,
        words,
        wordButton,
        score,
        board,
        menuButton,

        //dummyDef = "jksldh fjklsdh fklsdh fkljsdh flkjsdh flkj lksdj fklsdj flksdj flksdj flksdj flksdj " +
        //    "flskdjf lskdjf lsdkfj\njkh fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh fkjsdh fkjsdhf ksjdhf\n" +
        //    "jkh fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh fkjsdh fkjsdhf ksjdhf\njkh fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh" +
        //    "fkjsdh fkjsdhf ksjdhf\njkh fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh fkjsdh fkjsdhf ksjdhf\njkh fdkjdsh fksjdfh " +
        //    "kjsdhf\nsjkdhf kjsdh fkjsdh fkjsdhf ksjdhf\njksldh fjklsdh fklsdh fkljsdh flkjsdh flkj lksdj fklsdj flksdj " +
        //    "flksdj flksdj flksdj flskdjf lskdjf lsdkfj\njkh fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh fkjsdh fkjsdhf ksjdhf\njkh" +
        //    " fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh fkjsdh fkjsdhf ksjdhf\njkh fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh fkjsdh fkjsdhf" +
        //    " ksjdhf\njkh fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh fkjsdh fkjsdhf ksjdhf\njkh fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh " +
        //    "fkjsdh fkjsdhf ksjdhf\njksldh fjklsdh fklsdh fkljsdh flkjsdh flkj lksdj fklsdj flksdj flksdj flksdj flksdj flskdjf lsk" +
        //    "djf lsdkfj\njkh fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh fkjsdh fkjsdhf ksjdhf\njkh fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh fkjsd" +
        //    "h fkjsdhf ksjdhf\njkh fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh fkjsdh fkjsdhf ksjdhf\njkh fdkjdsh fksjdfh kjsdhf\nsjkdhf k" +
        //    "jsdh fkjsdh fkjsdhf ksjdhf\njkh fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh fkjsdh fkjsdhf ksjdhf\n";

    //////////////////////////////////////////////////////////////////////

        Game = function () {
            chs.Drawable.call(this);
            this.dimensions = { width: 800, height: 600 };
            loader = new chs.Loader('img/');
            wordButton = loader.load("wordbutton.png");
            consolas = chs.Font.load("Consolas", loader);
            arial = chs.Font.load("Arial", loader);
            Dictionary.init(loader.load("dictionary.json"));
            loader.load("allColour.png");
            words = new chs.Drawable();
            this.addChild(words);
            this.addChild(new chs.SpriteButton(loader.load("undo.png"), "scale", 580, 490, this.undo, null));
            this.addChild(new chs.SpriteButton(loader.load("redo.png"), "scale", 620, 490, this.redo, null));
            menuButton = new chs.FancyTextButton("Menu", consolas, 730, 505, 100, 40).setPivot(0.5, 0.5);
            this.addChild(menuButton);
            score = new chs.Label("Score: 0", consolas).setPosition(690, 11);
            this.addChild(score);
            chs.desktop.addChild(loader);
            loader.start(this.loadComplete, this);
        };

    //////////////////////////////////////////////////////////////////////

    chs.extend(Game, chs.Drawable);

    return chs.override(Game, {

        //////////////////////////////////////////////////////////////////////

        loadComplete: function (loader) {
            board = new Board(loader);
            this.addChild(board);
            chs.desktop.removeChild(loader);
            chs.desktop.addChild(this);
        },

        //////////////////////////////////////////////////////////////////////

        undo: function () {

        },

        //////////////////////////////////////////////////////////////////////

        redo: function () {

        },

        onMouseMove: function (e) {
            chs.Debug.text("MOUVE!");
            return true;
        },

        //////////////////////////////////////////////////////////////////////

        showDefinition: function (w) {
            var def = Dictionary.getDefinition(w.str),
                window,
                scoreLabel,
                textBox;
            window = new chs.Window(80, 60, 640, 480, w.str.toUpperCase(), arial, 16, 0.75);
            window.modal = true;
            scoreLabel = new chs.Label(w.score.toString() + " points", consolas);
            textBox = new chs.TextBox(16, 16, 640 - 32, 480 - 32, def, consolas, '\r    ', 10, 2, function (link) {
                this.text = link.toUpperCase();
                textBox.text = Dictionary.getDefinition(link);
                scoreLabel.text = Board.getWordScore(link).toString() + " points";
            }, window);
            scoreLabel.setPosition(window.titleBar.width - 16, window.titleBar.height / 2 - 2);
            scoreLabel.setPivot(1, consolas.baseline / consolas.height / 2)
            window.titleBar.addChild(scoreLabel);
            window.client.addChild(textBox);
            this.addChild(window);
        },

        //////////////////////////////////////////////////////////////////////

        onUpdate: function (deltaTime) {
            var y = 50;
            if (board.changed) {
                words.removeChildren();
                board.wordList().forEach(function (w) {
                    var button = new chs.SpriteButton(wordButton, "scale", 736, y, function () {
                        this.showDefinition(w);
                    }, this);
                    button.setPivot(0.5, 0.5);
                    button.addChild(new chs.Label(w.str, consolas).setPosition(7, button.height / 2).setPivot(0, 0.5));
                    button.addChild(new chs.Label(w.score.toString(), consolas).setPosition(120, button.height / 2).setPivot(1, 0.5));
                    button.word = w;
                    y += button.height + 2;
                    words.addChild(button);
                }, this);
                board.changed = false;
                score.text = "Score: " + board.score.toString();
            }
            menuButton.rotation = chs.Timer.time / 1000;
        }

    });

}());
