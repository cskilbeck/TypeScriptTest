(function () {
    "use strict";

    var buttons = new chs.List("listNode");

    mtw.WordButton = chs.Class({ inherit$: [chs.Composite, chs.PanelButton],

        static$: {
            reset: function () {
                buttons = new chs.List("listNode");
            },

            findButton: function (wrd) {
                return buttons.findFirstOf(function(w) {
                    if(w.word.str == wrd.str) {
                        return true;
                    }
                });
            },

            create: function(wrd, board, x, y, w, h, font, callback, context) {
                var b = mtw.WordButton.findButton(wrd);
                if(b !== null) {
                    console.log("Reusing! " + b.word.str);
                    buttons.remove(b);
                    b.x = x;
                    b.y = y;
                    b.setDirty(true);
                    b.clearEventHandlers();
                    b.state = chs.Button.idle;
                } else {
                    b = new mtw.WordButton(wrd, board, x, y, w, h, font, callback, context);
                    console.log("New word! " + wrd.str);
                }
                return b;
            },

            dispose: function(button) {
                if(buttons.size > 50) {
                    buttons.popBack();
                }
                buttons.pushFront(button);
            },

            showCache: function () {
                buttons.forEach(function(w) {
                    chs.Debug.print("     ", w.word.str);
                });
            }
        },

        $: function (wrd, board, x, y, w, h, font, callback, context) {
            chs.Composite.call(this);
            chs.PanelButton.call(this, x, y, w, h, "darkslategrey", undefined, 4, 0, callback, context);
            this.listNode = new chs.List.Node(this);
            this.board = board;
            this.used = 0;
            this.word = wrd;
            this.wordHighlight = null;
            this.addChild(new chs.Label(wrd.str, font).setPosition(5, this.height / 2).setPivot(0, font.midPivot));
            this.addChild(new chs.Label(wrd.score.toString(), font).setPosition(this.width - 8, this.height / 2).setPivot(1, font.midPivot));
            this.compose();
        },

        onClicked: function () {
            this.state = chs.Button.idle;
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
                h;
            if(this.wordHighlight === null) {
                b = this.board.getWordTile(this.word, 0);
                e = this.board.getWordTile(this.word, this.word.str.length - 1);
                tl = b.position;
                br = e.position;
                x = tl.x - mtw.BoardTile.width / 2;
                y = tl.y - mtw.BoardTile.height / 2;
                w = br.x + mtw.BoardTile.width / 2 - x;
                h = br.y + mtw.BoardTile.height / 2 - y;
                x += 6;
                y += 6;
                w -= 12;
                h -= 12;
                this.wordHighlight = new chs.OutlineRectangle(x, y, w, h, 10, "yellow", 5);
                this.board.addChild(this.wordHighlight);
                this.wordHighlight.zIndex = 2;
                this.wordHighlight.onUpdate = function(time, deltaTime) {
                    this.transparency = Math.sin(time / 40) * 48 + 207;
                }
            }
        },


    });

}());