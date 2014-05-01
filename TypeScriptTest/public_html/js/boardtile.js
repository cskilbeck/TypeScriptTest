﻿//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var tileWidth = 96,
        tileHeight = 96,
        font,
        digits,
        tileImage;

    //////////////////////////////////////////////////////////////////////

    mtw.BoardTile = chs.Class({
        inherit$: [mtw.Tile, chs.Sprite],

        static$: {

            width: tileWidth,
            height: tileHeight,

            load: function (loader) {
                font = chs.Font.load("Arial", loader);
                digits = chs.Font.load("digits", loader);
                tileImage = loader.load("allColour.png");
            }
        },

        $: function (letter, x, y) {
            mtw.Tile.call(this, letter);
            chs.Sprite.call(this, tileImage);
            this.font = font;
            this.framesWide = 5;
            this.framesHigh = 5;
            this.frameWidth = tileWidth;
            this.frameHeight = tileHeight;
            this.selected = false;
            this.swapped = false;
            this.setPivot(0.5, 0.5);
            this.setPosition(x * tileWidth + tileWidth / 2, y * tileHeight + tileHeight / 2);
            this.org = {
                x: this.position.x,
                y: this.position.y
            };
            this.label = new chs.Label(letter, font).setPivot(0.5, font.midPivot);
            this.label.setPosition(this.width / 2 - 1, this.height / 2);
            this.digits = new chs.Label(mtw.Letters.letterScore(letter).toString(), digits).setPivot(1, 1).setPosition(this.width - 12, this.height - 8);
            this.digits.transparency = 64;
            this.addChild(this.label);
            this.addChild(this.digits);
        },

        //////////////////////////////////////////////////////////////////////

        letter: {
            get: function () {
                return this.myLetter;
            },
            set: function (s) {
                this.myLetter = s;
                this.label.text = s.toUpperCase();
                this.digits.text = mtw.Letters.letterScore(s).toString();
            }
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

        onUpdate: function (time, deltaTime) {
            var hi = this.wordIndices[mtw.Word.horizontal],
                vi = this.wordIndices[mtw.Word.vertical],
                sx = hi.position,
                sy = vi.position;
            if (hi.word === null && vi.word === null) {
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
            if (this.pulse) {
                this.label.setScale(Math.sin(time / 25) * 0.025 + 1.1);
            }
            this.setFrameXY(sx, sy);
        }
    });

}());