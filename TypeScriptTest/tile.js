//////////////////////////////////////////////////////////////////////

/*global Font, ImageLoader, Arial, Orientation */
/*jslint maxlen: 130 */

//////////////////////////////////////////////////////////////////////

var Tile = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var None = 0,
        Beginning = 1,
        Middle = 2,
        End = 3,
        font = new Font(Arial),
        tiles = ImageLoader.load("allColour"),

    //////////////////////////////////////////////////////////////////////

        Tile = function (letter, x, y) {
            this.letter = letter;
            this.x = x * Tile.width;
            this.y = y * Tile.height;
            this.layer = 0;
            this.selected = false;

            // a tile can be part of a horizontal and/or vertical word
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
        // draw tile background

        drawTile: function (context) {
            var sx = this.horizontal.position * Tile.width,
                sy = this.vertical.position * Tile.height;
            if (this.horizontal.word === null && this.vertical.word === null) {
                sy = 384;
            }
            if (this.selected) {
                sx = 384;
                sy = 0;
            }
            context.drawImage(tiles, sx, sy, Tile.width, Tile.height, this.x, this.y, Tile.width, Tile.height);
        },

        //////////////////////////////////////////////////////////////////////
        // draw the letter

        drawLetter: function (context) {
            var u = this.letter.toUpperCase(),
                dim = font.measureText(u);
            font.drawText(context, this.x + 48 - dim.width / 2, this.y + 28, u);
        },

        //////////////////////////////////////////////////////////////////////
        // draw whole tile

        draw: function (context) {
            this.drawTile(context);
            this.drawLetter(context);
        }
    };

    //////////////////////////////////////////////////////////////////////

    Tile.width = 96;
    Tile.height = 96;

    return Tile;

}());
