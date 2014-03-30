//////////////////////////////////////////////////////////////////////

/*global Font, ImageLoader, Arial, Orientation */

//////////////////////////////////////////////////////////////////////

var Tile = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Beginning = 1,
        Middle = 2,
        End = 3,
        font = new Font(Arial),
        tiles = ImageLoader.load("allColour"),

    //////////////////////////////////////////////////////////////////////

        Tile = function (letter, x, y) {
            this.letter = letter;
            this.x = x * 96;
            this.y = y * 96;
            this.layer = 0;
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

        drawTile: function (context) {
            var sx = this.horizontal.position * 96,
                sy = this.vertical.position * 96;
            if (this.horizontal.word === null && this.vertical.word === null) {
                sy += 384;
            }
            context.drawImage(tiles, sx, sy, 96, 96, this.x, this.y, 96, 96);
        },

        //////////////////////////////////////////////////////////////////////

        drawLetter: function (context) {
            var u = this.letter.toUpperCase(),
                dim = font.measureText(u);
            font.drawText(context, this.x + 48 - dim.width / 2, this.y + 28, u);
        },

        //////////////////////////////////////////////////////////////////////

        draw: function (context) {
            this.drawTile(context);
            this.drawLetter(context);
        }
    };

    //////////////////////////////////////////////////////////////////////

    return Tile;

}());
