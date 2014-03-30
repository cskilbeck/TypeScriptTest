//////////////////////////////////////////////////////////////////////

"use strict"

//////////////////////////////////////////////////////////////////////

var Board = (function () {

    //////////////////////////////////////////////////////////////////////

    var letters = [
        { score: 1, frequency: 9 },	    //A
        { score: 3, frequency: 2 },	    //B
        { score: 3, frequency: 2 },	    //C 
        { score: 2, frequency: 4 },	    //D
        { score: 1, frequency: 12 },	//E
        { score: 4, frequency: 2 },	    //F
        { score: 2, frequency: 3 },	    //G
        { score: 4, frequency: 2 },	    //H
        { score: 1, frequency: 9 },	    //I
        { score: 8, frequency: 1 },	    //J
        { score: 5, frequency: 1 },	    //K
        { score: 1, frequency: 4 },	    //L
        { score: 3, frequency: 2 },	    //M
        { score: 1, frequency: 6 },	    //N
        { score: 1, frequency: 8 },	    //O
        { score: 3, frequency: 2 },	    //P
        { score: 10, frequency: 1 },	//Q
        { score: 1, frequency: 6 },	    //R
        { score: 1, frequency: 4 },	    //S
        { score: 1, frequency: 6 },	    //T
        { score: 1, frequency: 4 },	    //U
        { score: 4, frequency: 2 },	    //V
        { score: 4, frequency: 2 },	    //W
        { score: 8, frequency: 1 },	    //X
        { score: 4, frequency: 2 },	    //Y
        { score: 10, frequency: 1 }     //Z
    ];

    //////////////////////////////////////////////////////////////////////

    var aToZ = "abcdefghijklmnopqrstuvwxyz";
    var distribution = [];
    var foundWords = [];
    var words = [];

    //////////////////////////////////////////////////////////////////////

    var Board = function () {
        this.width = 7;
        this.height = 5;
        this.length = this.width * this.height;
        this.board = new Array(this.length);
        this.words = [];
        for (var i = 0; i < letters.length; ++i) {
            var score = letters[i].score;
            var frequency = letters[i].frequency;
            for (var j = 0; j < frequency; ++j) {
                distribution.push(i);
            }
        }
        for (var i = 0; i < this.board.length; ++i) {
            this.board[i] = new Tile(this.randomLetter(), i % this.width, (i / this.width) >>> 0);
        }
        this.markAllWords();
    };

    //////////////////////////////////////////////////////////////////////

    Board.prototype = {

        //////////////////////////////////////////////////////////////////////

        tile: function (x, y) {
            return this.board[x + y * this.width];
        },

        //////////////////////////////////////////////////////////////////////

        letter: function (x, y) {
            return tile(x, y).letter;
        },

        //////////////////////////////////////////////////////////////////////

        randomLetter: function () {
            var r = Math.floor(Math.random() * distribution.length);
            return aToZ[distribution[r]];
        },

        //////////////////////////////////////////////////////////////////////

        draw: function (context) {
            for (var i = 0; i < this.board.length; ++i) {
                this.board[i].draw(context);
            }
        },

        //////////////////////////////////////////////////////////////////////

        getScore: function (str) {
            var s = 0;
            var A = 97; // "a".getCodeAt(0)
            for (var i = 0; i < str.length; ++i) {
                var char = str.charCodeAt(i);
                char -= A;
                s += letters[char].score;
            }
            return s * str.length;
        },

        //////////////////////////////////////////////////////////////////////

        markWordPass: function (orientation, offset, limit, xMul, yMul) {

            var xLim = this.width - 2 * xMul;
            var yLim = this.height - 2 * yMul;

            for (var y = 0; y < yLim; ++y)
            {
                for (var x = 0; x < xLim; ++x)
                {
                    var n = x + y * this.width;
                    var t = x * xMul + y * yMul;

                    for (var e = 3; e + t <= limit; ++e)
                    {
                        var m = n;
                        var i = 0;
                        var checkString = [];
                        for (; i < e; ++i)
                        {
                            checkString[i] = this.board[m].letter;
                            m += offset;
                        }
                        var string = checkString.join('');

                        // is that a word?
                        if(Dictionary.hasOwnProperty(string)) {
                            foundWords.push(new Word(string, x, y, orientation, this.getScore(string)));
                        }
                    }
                }
            }
        },

        //////////////////////////////////////////////////////////////////////

        getWordTile: function (w, i) {
            var yo = w.orientation;
            var xo = 1-yo;
            return this.board[(w.x + xo * i) + (w.y + yo * i) * this.width];
        },

        //////////////////////////////////////////////////////////////////////

        markAllWords: function () {

            words = [];         // valid words
            foundWords = [];    // all the words, including overlapped ones

            this.markWordPass(horizontal, 1, this.width, 1, 0);
            this.markWordPass(vertical, this.width, this.height, 0, 1);

            foundWords.sort(function (a, b) {
                return a.compare(b);
            });

            while (foundWords.length > 0) {
                var w = foundWords[0];
                foundWords.shift();
                var i;
                for (i = 0; i < w.str.length; ++i) {
                    var t = this.getWordTile(w, i);
                    if (t.vertical.word != null && w.orientation == vertical || t.horizontal.word != null && w.orientation == horizontal) {
                        break;
                    }
                }
                if (i == w.str.length) {
                    words.push(w);
                    for (var j = 0; j < w.str.length; ++j) {
                        this.getWordTile(w, j).setWord(w, j);
                    }
                }
            }
        }
    }

    //////////////////////////////////////////////////////////////////////

    return Board;
}());