//////////////////////////////////////////////////////////////////////
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
        //            "flskdjf lskdjf lsdkfj\njkh fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh fkjsdh fkjsdhf ksjdhf\n" +
        //            "jkh fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh fkjsdh fkjsdhf ksjdhf\njkh fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh" +
        //            "fkjsdh fkjsdhf ksjdhf\njkh fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh fkjsdh fkjsdhf ksjdhf\njkh fdkjdsh fksjdfh " +
        //            "kjsdhf\nsjkdhf kjsdh fkjsdh fkjsdhf ksjdhf\njksldh fjklsdh fklsdh fkljsdh flkjsdh flkj lksdj fklsdj flksdj " +
        //            "flksdj flksdj flksdj flskdjf lskdjf lsdkfj\njkh fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh fkjsdh fkjsdhf ksjdhf\njkh" +
        //            " fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh fkjsdh fkjsdhf ksjdhf\njkh fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh fkjsdh fkjsdhf" +
        //            " ksjdhf\njkh fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh fkjsdh fkjsdhf ksjdhf\njkh fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh " +
        //            "fkjsdh fkjsdhf ksjdhf\njksldh fjklsdh fklsdh fkljsdh flkjsdh flkj lksdj fklsdj flksdj flksdj flksdj flksdj flskdjf lsk" +
        //            "djf lsdkfj\njkh fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh fkjsdh fkjsdhf ksjdhf\njkh fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh fkjsd" +
        //            "h fkjsdhf ksjdhf\njkh fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh fkjsdh fkjsdhf ksjdhf\njkh fdkjdsh fksjdfh kjsdhf\nsjkdhf k" +
        //            "jsdh fkjsdh fkjsdhf ksjdhf\njkh fdkjdsh fksjdfh kjsdhf\nsjkdhf kjsdh fkjsdh fkjsdhf ksjdhf\n";

    //////////////////////////////////////////////////////////////////////

        Game = function (loader) {
            chs.Drawable.call(this);
            wordButton = loader.load("wordbutton.png");
            consolas = chs.Font.load("Consolas", loader);
            arial = chs.Font.load("Arial", loader);

            Dictionary.init(loader.load("dictionary.json"));

            board = new Board(loader);
            this.addChild(board);

            this.addChild(new chs.SpriteButton(loader.load("undo.png"), "scale", 580, 490, this.undo, null));
            this.addChild(new chs.SpriteButton(loader.load("redo.png"), "scale", 620, 490, this.redo, null));

            menuButton = new chs.FancyTextButton("Menu", consolas, 680, 485, 100, 40);
            this.addChild(menuButton);

            score = new chs.Label("Score: 0", consolas).setPosition(690, 11);
            this.addChild(score);

            words = new chs.Drawable();
            this.addChild(words);
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

        //////////////////////////////////////////////////////////////////////

        onUpdate: function (deltaTime) {
            var y = 50;
            if (board.changed) {
                words.removeChildren();
                board.wordList().forEach(function (w) {
                    button = new chs.SpriteButton(wordButton, "scale", 736, y, function () {
                        var def = consolas.wrapText(Dictionary.getDefinition(w.str), 600, '\n    '),
                            links = [],
                            i,
                            linkLeft,
                            linkRight,
                            linkTop,
                            linkBottom,
                            link,
                            clip,
                            wordLabel,
                            defLabel,
                            scoreLabel,
                            panel = new chs.PanelButton(80, 60, 640, 480, 'black', undefined, 20, 0, function () {
                                this.close();
                            });
                        panel.modal = true;
                        panel.transparency = 224;
                        clip = new chs.ClipRect(0, 0, 640, 480, 20);
                        consolas.measureText(def, undefined, links);    // these should be clipped to the panel...
                        while (links.length > 0) {
                            linkLeft = ((links.shift() + 17) >>> 0) + 0.5;
                            linkTop = ((links.shift() + 65) >>> 0) + 0.5;
                            linkRight = ((links.shift() + 15) >>> 0) + 0.5;
                            linkBottom = ((links.shift() + 65) >>> 0) + 0.5;
                            link = new chs.LinkButton(linkLeft, linkTop, linkRight - linkLeft, linkBottom - linkTop);
                            clip.addChild(link);
                        }
                        defLabel = new chs.Label(def, consolas).setPosition(16, 68);
                        wordLabel = new chs.Label(w.str.toUpperCase(), arial).setPosition(16, 14).setScale(0.75);
                        scoreLabel = new chs.Label(w.score.toString() + " points", consolas).setPosition(620, 22).setPivot(1, 0);
                        clip.addChild(new chs.Panel(0, 0, 640, 54, 'darkgrey', undefined, 0));
                        clip.addChild(defLabel);
                        clip.addChild(wordLabel);
                        clip.addChild(scoreLabel);
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
        }
    });

}());
