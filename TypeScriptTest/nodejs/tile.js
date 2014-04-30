//////////////////////////////////////////////////////////////////////

mtw.Tile = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var None = 0,
        Beginning = 1,
        Middle = 2,
        End = 3;

    //////////////////////////////////////////////////////////////////////


    return chs.Class({

        $: function (letter) {
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
            wrd = (w.orientation === mtw.Word.horizontal) ? this.horizontal : this.vertical;
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
        }

    });

}());