//////////////////////////////////////////////////////////////////////

/*global Tile, Dictionary, Word, Orientation */
/*jslint plusplus: true, bitwise: true */

//////////////////////////////////////////////////////////////////////

var Board = (function () {

    "use strict";

    //////////////////////////////////////////////////////////////////////

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

    //////////////////////////////////////////////////////////////////////

        aToZ = "abcdefghijklmnopqrstuvwxyz",
        distribution = [],
        foundWords = [],
        words = [],

    //////////////////////////////////////////////////////////////////////

        Board = function () {
            var i,
                j,
                frequency;
            this.score = 0;
            this.score = 0;
            this.width = 7;
            this.height = 5;
            this.length = this.width * this.height;
            this.board = new Array(this.length);
            this.words = [];
            for (i = 0; i < letters.length; ++i) {
                this.score += letters[i].score;
                frequency = letters[i].frequency;
                for (j = 0; j < frequency; ++j) {
                    distribution.push(i);
                }
            }
            for (i = 0; i < this.board.length; ++i) {
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
            return this.tile(x, y).letter;
        },

        //////////////////////////////////////////////////////////////////////

        randomLetter: function () {
            var r = Math.floor(Math.random() * distribution.length);
            return aToZ[distribution[r]];
        },

        //////////////////////////////////////////////////////////////////////

        draw: function (context) {
            var i;
            for (i = 0; i < this.board.length; ++i) {
                this.board[i].draw(context);
            }
        },

        //////////////////////////////////////////////////////////////////////

        getScore: function (str) {
            var s = 0,
                A = 97, // "a".getCodeAt(0)
                i;
            for (i = 0; i < str.length; ++i) {
                s += letters[str.charCodeAt(i) - A].score;
            }
            return s * str.length;
        },

        //////////////////////////////////////////////////////////////////////

        markWordPass: function (orientation, offset, limit, xMul, yMul) {

            var xLim = this.width - 2 * xMul,
                yLim = this.height - 2 * yMul,
                y,
                x,
                n,
                t,
                e,
                m,
                i,
                string,
                checkString;

            for (y = 0; y < yLim; ++y) {
                for (x = 0; x < xLim; ++x) {
                    n = x + y * this.width;
                    t = x * xMul + y * yMul;

                    for (e = 3; e + t <= limit; ++e) {
                        m = n;
                        checkString = [];
                        for (i = 0; i < e; ++i) {
                            checkString[i] = this.board[m].letter;
                            m += offset;
                        }
                        string = checkString.join('');

                        // is that a word?
                        if (Dictionary.hasOwnProperty(string)) {
                            foundWords.push(new Word(string, x, y, orientation, this.getScore(string)));
                        }
                    }
                }
            }
        },

        //////////////////////////////////////////////////////////////////////

        getWordTile: function (w, i) {
            var yo = w.orientation,
                xo = 1 - yo;
            return this.board[(w.x + xo * i) + (w.y + yo * i) * this.width];
        },

        //////////////////////////////////////////////////////////////////////

        markAllWords: function () {

            var w,
                i,
                t,
                j;
            words = [];         // valid words
            foundWords = [];    // all the words, including overlapped ones

            this.markWordPass(Orientation.horizontal, 1, this.width, 1, 0);
            this.markWordPass(Orientation.vertical, this.width, this.height, 0, 1);

            foundWords.sort(function (a, b) {
                return a.compare(b);
            });

            while (foundWords.length > 0) {
                w = foundWords[0];
                foundWords.shift();
                for (i = 0; i < w.str.length; ++i) {
                    t = this.getWordTile(w, i);
                    if ((t.vertical.word !== null && w.orientation === Orientation.vertical) || (t.horizontal.word !== null && w.orientation === Orientation.horizontal)) {
                        break;
                    }
                }
                if (i === w.str.length) {
                    words.push(w);
                    for (j = 0; j < w.str.length; ++j) {
                        this.getWordTile(w, j).setWord(w, j);
                    }
                }
            }
        }
    };

    //////////////////////////////////////////////////////////////////////

    return Board;
}());