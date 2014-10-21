(function () {
    "use strict";

    var buttons = [];

    mtw.WordButton = glib.Class({ inherit$: [glib.Composite, glib.PanelButton],

        static$: {
            reset: function () {
                buttons = [];
            },

            findButton: function (wrd) {
                var i,
                    l;
                for (i = 0, l = buttons.length; i < l; ++i) {
                    if (buttons[i].word.str === wrd.str) {
                        return buttons[i];
                    }
                }
                return null;
            },

            create: function(wrd, board, game, x, y, w, h, font, callback, context) {
                var b = mtw.WordButton.findButton(wrd);
                if(b !== null) {
                    glib.Util.remove(buttons, b);
                    b.word = wrd;
                    b.reset();
                    b.setPosition(x, y);
                } else {
                    b = new mtw.WordButton(wrd, board, game, x, y, w, h, font, callback, context);
                }
                return b;
            },

            dispose: function(button) {
                if(buttons.size > 50) { // 50? I dunno, maybe...
                    buttons.shift();
                }
                button.reset();
                buttons.push(button);
            },

            showCache: function () {
                var i,
                    l;
                for (i = 0, l = buttons.length; i < l; ++i) {
                    glib.Debug.print("     ", buttons[i].word.str);
                }
            }
        },

        $: function (wrd, board, game, x, y, w, h, font, callback, context) {
            glib.Composite.call(this);
            glib.PanelButton.call(this, x, y, w, h, "darkslategrey", undefined, 4, 0, callback, context);
            this.board = board;
            this.game = game;
            this.word = wrd;
            this.wordHighlight = null;
            this.shader = null;
            this.addChild(new glib.Label(wrd.str, font).setPosition(5, this.height / 2).setPivot(0, font.midPivot));
            this.addChild(new glib.Label(wrd.score.toString(), font).setPosition(this.width - 8, this.height / 2).setPivot(1, font.midPivot));
            this.addEventHandler("clicked", function () {
                game.showDefinition(this.word);
            }, this);
            this.addEventHandler("idle", function () {
                this.clearWordHighlight();
            }, this);
            this.addEventHandler("hover", function () {
                this.setWordHighlight();
            }, this);
            this.addEventHandler("pressed", function () {
                this.setWordHighlight();
            }, this);
            this.compose();
        },

        reset: function () {
            this.clearWordHighlight();
            this.shader = null;
            this.state = glib.Button.idle;
        },

        onClicked: function () {
            this.state = glib.Button.idle;
        },

        onIdle: function () {
            this.fillColour = "darkslategrey";
            this.compose();
        },

        onPressed: function () {
            this.fillColour = "aquamarine";
            this.compose();
        },

        onHover: function () {
            this.fillColour = "lightslategrey";
            this.compose();
        },

        clearWordHighlight: function () {
            if(this.wordHighlight !== null) {
                this.board.removeChild(this.wordHighlight);
                this.wordHighlight = null;
            }
        },

        setWordHighlight: function () {
            var b,
                e,
                tl,
                br,
                x,
                y,
                w,
                h,
                i = 6;
            if(this.wordHighlight === null) {
                b = this.board.getWordTile(this.word, 0);
                e = this.board.getWordTile(this.word, this.word.str.length - 1);
                tl = b.position;
                br = e.position;
                x = tl.x - mtw.BoardTile.width / 2;
                y = tl.y - mtw.BoardTile.height / 2;
                w = br.x + mtw.BoardTile.width / 2 - x;
                h = br.y + mtw.BoardTile.height / 2 - y;
                x += i;
                y += i;
                w -= i * 2;
                h -= i * 2;
                this.wordHighlight = new glib.Drawable();
                this.wordHighlight.setPosition(x, y);
                this.shader = new glib.SolidRectangle(0, 0, w, h, 10, "white");
                this.wordHighlight.addChild(this.shader);
                this.wordHighlight.addChild(new glib.OutlineRectangle(0, 0, w, h, 10, "white", 6));
                this.shader.transparency = 64;
                this.board.addChild(this.wordHighlight);
                this.wordHighlight.zIndex = 2;
                this.shader.onUpdate = function(time, deltaTime) {
                    this.transparency = Math.sin(time / 80) * 16 + 64;
                };
            }
        },


    });

}());