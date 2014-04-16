//////////////////////////////////////////////////////////////////////
// Mouse Events
// Font Layer Mask
// TextBox
// Undo/Redo/SaveBest
// Title screen
// Mobile: Android/Chrome, iOS/Safari, Windows Phone: IE // Touch Support
// Fix tile grabbing/moving/swapping/lerping
// Flying scores/fizz/particles
// OAuth/AWS/Leaderboards
// Font: embedded control characters
// Drawable: Window, TextBox (scrollable, links, stack etc)
// Panel: rounded corners, outline
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

        Game = function (loader) {
            chs.Drawable.call(this);
            wordButton = loader.load("wordbutton.png");
            consolas = chs.Font.load("Consolas", loader);
            arial = chs.Font.load("Arial", loader);

            Dictionary.init(loader.load("dictionary.json"));

            words = new chs.Drawable();
            this.addChild(words);

            this.addChild(new chs.SpriteButton(loader.load("undo.png"), "scale", 580, 490, this.undo, null));
            this.addChild(new chs.SpriteButton(loader.load("redo.png"), "scale", 620, 490, this.redo, null));

            menuButton = new chs.FancyTextButton("Menu", consolas, 730, 505, 100, 40).setPivot(0.5, 0.5);
            this.addChild(menuButton);

            score = new chs.Label("Score: 0", consolas).setPosition(690, 11);
            this.addChild(score);

            board = new Board(loader);
            this.addChild(board);
        };

    //////////////////////////////////////////////////////////////////////

    chs.extend(Game, chs.Drawable);

    return chs.override(Game, {

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

        onMouseMove: function (e) {
            chs.Debug.text("MOUVE!");
            return true;
        },

        //////////////////////////////////////////////////////////////////////

        onUpdate: function (deltaTime) {
            var y = 50;
            if (board.changed) {
                words.removeChildren();
                board.wordList().forEach(function (w) {
                    button = new chs.SpriteButton(wordButton, "scale", 736, y, function () {
                        var def = Dictionary.getDefinition(w.str),
                        //var def = dummyDef,
                            i,
                            clip,
                            wordLabel,
                            scoreLabel,
                            panel = new chs.PanelButton(80, 60, 640, 480, 'black', undefined, 20, 0, function () {
                                this.close();
                            });
                        panel.modal = true;
                        panel.transparency = 224;
                        clip = new chs.ClipRect(0, 0, 640, 480, 20);
                        wordLabel = new chs.Label(w.str.toUpperCase(), arial).setPosition(16, 14).setScale(0.75);
                        scoreLabel = new chs.Label(w.score.toString() + " points", consolas).setPosition(620, 22).setPivot(1, 0);
                        clip.addChild(new chs.Panel(0, 0, 640, 54, 'darkgrey', undefined, 0));
                        clip.addChild(wordLabel);
                        clip.addChild(scoreLabel);
                        clip.addChild(new chs.TextBox(16, 68, 600, 480 - 68, def, consolas, '\r    ', 10, 2));
                        panel.addChild(clip);
                        panel.addChild(new chs.Line(0, 54, 640, 54, 'white', 4));
                        panel.addChild(new chs.Panel(0, 0, 640, 480, undefined, "white", 20, 4));
                        this.addChild(panel);
                    }, null, this);
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
