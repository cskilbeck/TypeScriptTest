(function () {
    "use strict";

    var buttons = new chs.List("listNode");

    mtw.WordButton = chs.Class({ inherit$: [chs.PanelButton, chs.Composite],

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

            create: function(wrd, x, y, w, h, font, callback, context) {
                var b = mtw.WordButton.findButton(wrd);
                if(b !== null) {
                    // console.log("Reusing! " + b.word.str);
                    buttons.remove(b);
                    b.x = x;
                    b.y = y;
                    b.clearEventHandlers();
                    b.state = chs.Button.idle;
                } else {
                    b = new mtw.WordButton(wrd, x, y, w, h, font, callback, context);
                    // console.log("New word! " + wrd.str);
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
                // buttons.forEach(function(w) {
                //     chs.Debug.print("     ", w.word.str);
                // });
            }
        },

        $: function (wrd, x, y, w, h, font, callback, context) {
            chs.PanelButton.call(this, x, y, w, h, "darkslategrey", undefined, 4, 0, callback, context);
            chs.Composite.call(this);
            this.listNode = new chs.List.Node(this);
            this.used = 0;
            this.word = wrd;
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
        }
    });

}());