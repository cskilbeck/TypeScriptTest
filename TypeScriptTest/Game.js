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
        consolasItalic,
        arial,
        words,
        wordButton,
        score,
        board,
        menuButton,

        //dummyDef = "jksldh fjklsdh fklsdh fkljsdh flkjsdh flkj lksdj fklsdj flksdj flksdj flksdj flksdj " +
        //    "flskdjf @lskdjf@ lsdkfj\njkh fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh fkjsdh fkjsdhf ksjdhf\n" +
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
            this.enabled = false;
            this.visible = false;
            this.dimensions = { width: 800, height: 600 };
            loader = new chs.Loader('img/');
            wordButton = loader.load("wordbutton.png");
            consolas = chs.Font.load("Consolas", loader);
            consolasItalic = chs.Font.load("Consolas_Italic", loader);
            consolasItalic.lineSpacing = 10;
            consolasItalic.softLineSpacing = 4;
            arial = chs.Font.load("Arial", loader);
            Dictionary.init(loader.load("dictionary.json"));
            loader.load("allColour.png");
            words = new chs.Drawable();
            this.addChild(words);
            this.addChild(new chs.SpriteButton(loader.load("undo.png"), "scale", 580, 490, this.undo, null));
            this.addChild(new chs.SpriteButton(loader.load("redo.png"), "scale", 620, 490, this.redo, null));
            menuButton = new chs.FancyTextButton("Menu", consolas, 730, 505, 100, 40).setPivot(0.5, 0.5);
            this.addChild(menuButton);
            score = new chs.Label("Score: 0", consolas).setPosition(681, 11);
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
            this.enabled = true;
            this.visible = true;
        },

        //////////////////////////////////////////////////////////////////////

        undo: function () {
            board.undo();
        },

        //////////////////////////////////////////////////////////////////////

        redo: function () {
            board.redo();
        },

        //////////////////////////////////////////////////////////////////////

        showDefinition: function (w) {
            var def = Dictionary.getDefinition(w.str),
                window,
                scoreLabel,
                textBox;
            window = new chs.Window(400, 300, 640, 480, w.str.toUpperCase(), arial, 12, "black", 0.5);
            window.transparency = 224;
            window.modal = true;
            window.setPivot(0.5, 0.5);
            window.setScale(0.75);
            window.age = 0.5;
            window.onUpdate = function (deltaTime) {
                var a;
                if (this.age < 1) {
                    this.age += deltaTime / 750;
                    if (this.age > 1) {
                        this.age = 1;
                    }
                    a = chs.Util.ease(chs.Util.ease(this.age));
                    this.rotation = (a - 1) * 3.14159265 * 0.5;
                    this.setScale(a);
                }
            };
            scoreLabel = new chs.Label(w.score.toString() + " points", consolasItalic);
            textBox = new chs.TextBox(16, 16, 640 - 32, 480 - 32, def, consolasItalic, '\r    ', function (link) {
                window.text = link.toUpperCase();
                textBox.text = Dictionary.getDefinition(link);
                scoreLabel.text = Board.getWordScore(link).toString() + " points";
            });
            scoreLabel.setPosition(window.titleBar.width - 16, window.titleBar.height / 2);
            scoreLabel.setPivot(1, consolasItalic.midPivot);
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
                    var button = new chs.PanelButton(676, y, 120, 24, "cadetblue", undefined, 4, 0, function () {
                        this.showDefinition(w);
                    }, this);
                    button.addChild(new chs.Label(w.str, consolas).setPosition(5, button.height / 2).setPivot(0, consolas.midPivot));
                    button.addChild(new chs.Label(w.score.toString(), consolas).setPosition(114, button.height / 2).setPivot(1, consolas.midPivot));
                    button.onIdle = function () { this.fillColour = "cadetblue"; };
                    button.onHover = function () { this.fillColour = "cornflowerblue"; };
                    button.onPressed = function () { this.fillColour = "aquamarine"; };
                    button.word = w;
                    y += button.height + 4;
                    words.addChild(button);
                }, this);
                board.changed = false;
                score.text = "Score: " + board.score.toString();
            }
            menuButton.rotation = chs.Timer.time / 1000;
        }

    });

}());
