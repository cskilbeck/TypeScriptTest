(function () {
    "use strict";

    var letters = [
            { score: 1, frequency: 9 },     //A
            { score: 3, frequency: 2 },     //B
            { score: 3, frequency: 2 },     //C
            { score: 2, frequency: 4 },     //D
            { score: 1, frequency: 12 },    //E
            { score: 4, frequency: 2 },     //F
            { score: 2, frequency: 3 },     //G
            { score: 4, frequency: 2 },     //H
            { score: 1, frequency: 9 },     //I
            { score: 8, frequency: 1 },     //J
            { score: 5, frequency: 1 },     //K
            { score: 1, frequency: 4 },     //L
            { score: 3, frequency: 2 },     //M
            { score: 1, frequency: 6 },     //N
            { score: 1, frequency: 8 },     //O
            { score: 3, frequency: 2 },     //P
            { score: 10, frequency: 1 },    //Q
            { score: 1, frequency: 6 },     //R
            { score: 1, frequency: 4 },     //S
            { score: 1, frequency: 6 },     //T
            { score: 1, frequency: 4 },     //U
            { score: 4, frequency: 2 },     //V
            { score: 4, frequency: 2 },     //W
            { score: 8, frequency: 1 },     //X
            { score: 4, frequency: 2 },     //Y
            { score: 10, frequency: 1 }     //Z
        ],

        asciiA = "a".charCodeAt(0),
        distribution = [];


    (function () {
        var i,
            j;
        for (i = 0; i < letters.length; ++i) {
            for (j = 0; j < letters[i].frequency; ++j) {
                distribution.push(String.fromCharCode(i + asciiA));
            }
        }
    }());

    mtw.Letters = chs.Class({

        static$: {
            random: function (random) {
                return distribution[random.next() % distribution.length];
            },

            getWordScore: function (str) {
                var s = 0,
                    i;
                for (i = 0; i < str.length; ++i) {
                    s += letters[str.charCodeAt(i) - asciiA].score;
                }
                return s * str.length;
            }
        }
    });

}());