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
            this.word = null;
            this.index = 0;
            this.position = 0;
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

        letter: {
            get: function () {
                return this.myLetter;
            },
            set: function (s) {
                this.myLetter = s;
            }
        },

        //////////////////////////////////////////////////////////////////////

        hasHorizontalWord: {
            get: function () {
                return this.wordIndices[mtw.Word.horizontal].word !== null;
            }
        },

        //////////////////////////////////////////////////////////////////////

        hasVerticalWord: {
            get: function () {
                return this.wordIndices[mtw.Word.vertical].word !== null;
            }
        },

        //////////////////////////////////////////////////////////////////////

        setWord: function (w, i) {
            var pos,
                wrd;
            if (i === 0) {
                pos = mtw.TilePos.Beginning;
            } else if (i === w.str.length - 1) {
                pos = mtw.TilePos.End;
            } else {
                pos = mtw.TilePos.Middle;
            }
            wrd = this.wordIndices[w.orientation];
            wrd.word = w;
            wrd.index = i;
            wrd.position = pos;
        },

        //////////////////////////////////////////////////////////////////////

        clearWords: function () {
            this.wordIndices[mtw.Word.horizontal].word = null;
            this.wordIndices[mtw.Word.horizontal].position = mtw.TilePos.None;
            this.wordIndices[mtw.Word.vertical].word = null;
            this.wordIndices[mtw.Word.vertical].position = mtw.TilePos.None;
        }

    });

}());