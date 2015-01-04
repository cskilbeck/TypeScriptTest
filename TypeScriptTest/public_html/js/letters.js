(function () {
    "use strict";

    var letters = [
            { score: 1, frequency: 9, vowel: true  },     //A
            { score: 3, frequency: 2, vowel: false },     //B
            { score: 3, frequency: 2, vowel: false },     //C
            { score: 2, frequency: 4, vowel: false },     //D
            { score: 1, frequency:12, vowel: true  },     //E
            { score: 4, frequency: 2, vowel: false },     //F
            { score: 2, frequency: 3, vowel: false },     //G
            { score: 4, frequency: 2, vowel: false },     //H
            { score: 1, frequency: 9, vowel: true  },     //I
            { score: 8, frequency: 1, vowel: false },     //J
            { score: 5, frequency: 1, vowel: false },     //K
            { score: 1, frequency: 4, vowel: false },     //L
            { score: 3, frequency: 2, vowel: false },     //M
            { score: 1, frequency: 6, vowel: false },     //N
            { score: 1, frequency: 8, vowel: true  },     //O
            { score: 3, frequency: 2, vowel: false },     //P
            { score:10, frequency: 1, vowel: false },     //Q
            { score: 1, frequency: 6, vowel: false },     //R
            { score: 1, frequency: 4, vowel: false },     //S
            { score: 1, frequency: 6, vowel: false },     //T
            { score: 1, frequency: 4, vowel: true  },     //U
            { score: 4, frequency: 2, vowel: false },     //V
            { score: 4, frequency: 2, vowel: false },     //W
            { score: 8, frequency: 1, vowel: false },     //X
            { score: 4, frequency: 2, vowel: true  },     //Y
            { score:10, frequency: 1, vowel: false }      //Z
        ],

        asciiA = "a".charCodeAt(0),
        distribution = [],
        vowelDistribution = [],
        consonantDistribution = [];

    (function () {
        var i,
            j,
            letter,
            dist;
        for (i = 0; i < letters.length; ++i) {
            dist = letters[i].vowel ? vowelDistribution : consonantDistribution;
            letter = String.fromCharCode(i + asciiA);
            for (j = 0; j < letters[i].frequency; ++j) {
                dist.push(letter);
                distribution.push(letter);
            }
        }
    }());

    mtw.Letters = glib.Class({

        static$: {
            random: function (random) {
                return distribution[random.ranged(distribution.length)];
            },

            randomVowel: function(random) {
                return vowelDistribution[random.ranged(vowelDistribution.length)];
            },

            randomConsonant: function(random) {
                return consonantDistribution[random.ranged(consonantDistribution.length)];
            },

            getWordScore: function (str) {
                var s = 0,
                    i;
                for (i = 0; i < str.length; ++i) {
                    s += letters[str.charCodeAt(i) - asciiA].score;
                }
                return s * str.length;
            },

            letterScore: function (letter) {
                return letters[letter.toLowerCase().charCodeAt(0) - asciiA].score;
            }
        }
    });

}());