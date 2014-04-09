﻿//////////////////////////////////////////////////////////////////////

var Tile = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var None = 0,
        Beginning = 1,
        Middle = 2,
        End = 3,
        font,
        tileSprite,

    //////////////////////////////////////////////////////////////////////

        Tile = function (letter, x, y) {
            this.listNode = listNode(this);
            this.letter = letter;
            this.layer = 0;
            this.selected = false;
            this.swapped = false;
            this.pos = {
                x: x * Tile.width,
                y: y * Tile.height
            };
            this.org = {
                x: this.pos.x,
                y: this.pos.y
            };
            this.target = {
                x: this.pos.x,
                y: this.pos.y
            };
            this.targetTime = 0;
            this.startTime = 0;
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
        };

    //////////////////////////////////////////////////////////////////////
    // static

    Tile.width = 96;
    Tile.height = 96;

    Tile.load = function (loader) {
        font = Font.load("Arial", loader);
        tileSprite = Sprite.load('allColour', loader);
        tileSprite.framesWide = 5;
        tileSprite.framesHigh = 5;
        tileSprite.frameWidth = Tile.width;
        tileSprite.frameHeight = Tile.height;
    };

    //////////////////////////////////////////////////////////////////////

    Tile.prototype = {

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
            wrd = (w.orientation === Orientation.horizontal) ? this.horizontal : this.vertical;
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

        setPosition: function (x, y) {
            this.pos.x = x;
            this.pos.y = y;
        },

        //////////////////////////////////////////////////////////////////////
        // put it back to its origin

        resetPosition: function () {
            this.pos.x = this.org.x;
            this.pos.y = this.org.y;
        },

        //////////////////////////////////////////////////////////////////////

        setTarget: function (x, y, duration) {
            this.target.x = x;
            this.target.y = y;
            this.startTime = Game.currentTime();
            this.targetTime = this.startTime + duration;
        },

        //////////////////////////////////////////////////////////////////////

        update: function () {
            var d,
                now = Game.currentTime();
            if (this.targetTime !== 0 && this.targetTime < now) {
                d = this.targetTime - this.startTime;
                this.setPosition(Util.lerp(this.origin, this.target, (this.targetTime - now)) / d);
                Debug.text(this.pos.x, this.pos.y, this.targetTime);
            } else {
                this.setPosition(this.target.x, this.target.y);
            }
        },

        //////////////////////////////////////////////////////////////////////
        // reset everything

        reset: function () {
            this.resetPosition();
            this.selected = false;
            this.swapped = false;
            this.layer = 0;
        },

        //////////////////////////////////////////////////////////////////////

        swap: function (b) {
            var t = b.letter;
            b.letter = this.letter;
            this.letter = t;
        },

        //////////////////////////////////////////////////////////////////////
        // draw tile background

        drawTile: function (context) {
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
            tileSprite.setFrameXY(sx, sy);
            tileSprite.setScale(this.selected ? 1.2 : 1);
            tileSprite.setPosition(this.pos.x + Tile.width / 2, this.pos.y + Tile.height / 2);
            tileSprite.draw(context);
        },

        //////////////////////////////////////////////////////////////////////
        // draw the letter

        drawLetter: function (context) {
            var xOffset = -1,
                yOffset = 6,
                u = this.letter.toUpperCase(),
                dim = font.measureText(u);
            font.drawText(context,
                u,
                {
                    x: this.pos.x + Tile.width / 2 - dim.width / 2 + xOffset,
                    y: this.pos.y + Tile.height / 2 - dim.height / 2 + yOffset
                });
        },

        //////////////////////////////////////////////////////////////////////
        // draw whole tile

        draw: function (context) {
            this.drawTile(context);
            this.drawLetter(context);
        }
    };

    //////////////////////////////////////////////////////////////////////
    // static const

    return Tile;

}());
