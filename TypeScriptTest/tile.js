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
        tileSprite,

    //////////////////////////////////////////////////////////////////////

        Tile = function (image, font, letter, x, y) {
            chs.Sprite.call(this, image);
            this.font = font;
            this.framesWidth = 5;
            this.framesHigh = 5;
            this.frameWidth = tileWidth;
            this.frameHeight = tileHeight;
            this.myLetter = letter;
            this.isSelected = false;
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
            this.label = new chs.Label(letter, font).setPosition(-1, 6).setPivot(0.5, 0.5);
            this.addChild(this.label);
        };

    //////////////////////////////////////////////////////////////////////

    Tile.width = tileWidth;
    Tile.height = tileHeight;

    //////////////////////////////////////////////////////////////////////

    Object.defineProperty(Tile.prototype, "selected", {
        get: function () {
            return this.isSelected;
        },
        set: function (s) {
            if (s !== this.isSelected) {
                this.isSelected = s;
                this.setScale(s ? 1.2 : 1);
            }
        }
    });

    //////////////////////////////////////////////////////////////////////

    Object.defineProperty(Tile.prototype, "letter", {
        get: function () {
            return this.myLetter;
        },
        set: function (s) {
            this.myLetter = s;
            this.label.text = s.toUpperCase();
        }
    });

    //////////////////////////////////////////////////////////////////////

    chs.Util.extendPrototype(Tile, chs.Sprite);

    return chs.Util.overridePrototype(Tile, {

        //////////////////////////////////////////////////////////////////////
        // mark this tile as part of word w at index i

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
            wrd = (w.orientation === Word.Orientation.horizontal) ? this.horizontal : this.vertical;
            wrd.word = w;
            wrd.index = i;
            wrd.position = pos;
        },

        //////////////////////////////////////////////////////////////////////
        // make this tile not part of any words

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

        onUpdate: function (deltaTime) {
            var sx = this.horizontal.position,
                sy = this.vertical.position;
            if (this.horizontal.word === null && this.vertical.word === null) {
                sy = 4;
            }
            if (this.selected) {
                sx = 4;
                sy = 0;
            }
            if (this.swapped) {
                sx = 4;
                sy = 2;
            }
            this.setFrameXY(sx, sy);
        }
    });

}());
