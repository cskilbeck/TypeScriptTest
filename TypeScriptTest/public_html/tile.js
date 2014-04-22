//////////////////////////////////////////////////////////////////////

Tile = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var None = 0,
        Beginning = 1,
        Middle = 2,
        End = 3,
        tileWidth = 96,
        tileHeight = 96,
        font,
        tileImage;

    //////////////////////////////////////////////////////////////////////


    return chs.Class({
        inherit$: [chs.Sprite],

        static$: {

            width: tileWidth,
            height: tileHeight,

            load: function (loader) {
                font = chs.Font.load("Arial", loader);
                tileImage = loader.load("allColour.png");
            }

        },

        $: function (letter, x, y) {
            chs.Sprite.call(this, tileImage);
            this.font = font;
            this.framesWide = 5;
            this.framesHigh = 5;
            this.frameWidth = tileWidth;
            this.frameHeight = tileHeight;
            this.myLetter = letter;
            this.selected = false;
            this.swapped = false;
            this.setPivot(0.5, 0.5);
            this.setPosition(x * tileWidth + tileWidth / 2, y * tileHeight + tileHeight / 2);
            this.org = {
                x: this.position.x,
                y: this.position.y
            };
            this.horizontal = {
                word: null,
                index: 0,
                position: 0
            };
            this.vertical = {
                word: null,
                index: 0,
                position: 0
            };
            this.label = new chs.Label(letter, font).setPivot(0.5, font.midPivot);
            this.label.setPosition(this.width / 2 - 1, this.height / 2);
            this.addChild(this.label);
        },

        letter: {
            get: function () {
                return this.myLetter;
            },
            set: function (s) {
                this.myLetter = s;
                this.label.text = s.toUpperCase();
            }
        },

        //////////////////////////////////////////////////////////////////////

        setWord: function (w, i) {
            var pos,
                wrd;
            if (i === 0) {
                pos = Beginning;
            } else if (i === w.str.length - 1) {
                pos = End;
            } else {
                pos = Middle;
            }
            wrd = (w.orientation === Word.horizontal) ? this.horizontal : this.vertical;
            wrd.word = w;
            wrd.index = i;
            wrd.position = pos;
        },

        //////////////////////////////////////////////////////////////////////

        clearWords: function () {
            this.horizontal.word = null;
            this.vertical.word = null;
            this.horizontal.position = None;
            this.vertical.position = None;
        },

        //////////////////////////////////////////////////////////////////////

        setOrigin: function (x, y) {
            this.org.x = x;
            this.org.y = y;
        },

        //////////////////////////////////////////////////////////////////////
        // put it back to its origin

        resetPosition: function () {
            this.setPosition(this.org.x, this.org.y);
        },

        //////////////////////////////////////////////////////////////////////
        // reset everything

        reset: function () {
            this.resetPosition();
            this.selected = false;
            this.swapped = false;
            this.zIndex = 0;
        },

        //////////////////////////////////////////////////////////////////////

        swap: function (b) {
            var t = b.letter;
            b.letter = this.letter;
            this.letter = t;
        },

        //////////////////////////////////////////////////////////////////////
        // draw tile background

        onUpdate: function (context) {
            var sx = this.horizontal.position,
                sy = this.vertical.position;
            if (this.horizontal.word === null && this.vertical.word === null) {
                sx = 0;
                sy = 4;
            }
            if (this.swapped) {
                sx = 4;
                sy = 2;
            }
            if (this.selected) {
                this.setScale(1.2);
                sx = 4;
                sy = 0;
            } else {
                this.setScale(1);
            }
            this.setFrameXY(sx, sy);
        }
    });

}());