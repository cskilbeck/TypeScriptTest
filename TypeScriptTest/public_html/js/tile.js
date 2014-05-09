//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////
    // these numbers can't be changed - they're used to index into
    // the spritesheet

    mtw.TilePos = {
        None: 0,
        Beginning: 1,
        Middle: 2,
        End: 3
    };

    //////////////////////////////////////////////////////////////////////

    mtw.TileWordIndex = chs.Class({
        $: function () {
            this.reset();
        },
        reset: function () {
            this.set(null, 0, 0);
        },
        set: function (w, i, p) {
            this.word = w;
            this.index = i;
            this.position = p;
        }
    });

    //////////////////////////////////////////////////////////////////////

    mtw.Tile = chs.Class({

        $: function (letter) {
            this.myLetter = letter;
            this.wordIndices = [
                new mtw.TileWordIndex(),
                new mtw.TileWordIndex()
            ];
        },

        letter: chs.Property({
            get: function () {
                return this.myLetter;
            },
            set: function (s) {
                this.myLetter = s;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        hasHorizontalWord: chs.Property({
            get: function () {
                return this.wordIndices[mtw.Word.horizontal].word !== null;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        hasVerticalWord: chs.Property({
            get: function () {
                return this.wordIndices[mtw.Word.vertical].word !== null;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        setWord: function (w, i) {
            var pos;
            if (i === 0) {
                pos = mtw.TilePos.Beginning;
            } else if (i === w.str.length - 1) {
                pos = mtw.TilePos.End;
            } else {
                pos = mtw.TilePos.Middle;
            }
            this.wordIndices[w.orientation].set(w, i, pos);
        },

        //////////////////////////////////////////////////////////////////////

        clearWords: function () {
            this.wordIndices[mtw.Word.horizontal].reset();
            this.wordIndices[mtw.Word.vertical].reset();
        }

    });

}());