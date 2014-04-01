//////////////////////////////////////////////////////////////////////

/*global Tile, Dictionary, Word, Orientation, Random */
/*jslint plusplus: true, bitwise: true, maxlen: 130 */

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
        random = new Random(),

    //////////////////////////////////////////////////////////////////////

        Board = function () {
            var i,
                j,
                frequency,
                wrd;
            this.score = 0;
            this.score = 0;
            this.width = 7;
            this.height = 5;
            this.length = this.width * this.height;
            this.board = [];
            this.board.length = this.length;

            // init the distribution table
            for (i = 0; i < letters.length; ++i) {
                frequency = letters[i].frequency;
                for (j = 0; j < frequency; ++j) {
                    distribution.push(i);
                }
            }

            // make a random board
            random.seed(1);
            for (i = 0; i < this.board.length; ++i) {
                this.board[i] = new Tile(this.randomLetter(), i % this.width, (i / this.width) >>> 0);
            }

            // nobble it until there are no words on it
            while (this.markAllWords() !== 0) {
                this.getWordTile(words[0], 0).letter = this.randomLetter();
            }
        };

    //////////////////////////////////////////////////////////////////////

    Board.prototype = {

        //////////////////////////////////////////////////////////////////////
        // Get the board as an ascii string

        toString: function() {
            var i,
                s = "";
            for (i = 0; i < this.length; ++i) {
                s += this.board[i].letter;
            }
            return s;
        },

        //////////////////////////////////////////////////////////////////////
        // Get the tile at x,y

        tile: function (x, y) {
            return this.board[x + y * this.width];
        },

        //////////////////////////////////////////////////////////////////////
        // Get the letter on a tile at x,y

        letter: function (x, y) {
            return this.tile(x, y).letter;
        },

        //////////////////////////////////////////////////////////////////////
        // Get a random letter from the distribution table

        randomLetter: function () {
            return aToZ[distribution[random.next() % distribution.length]];
        },

        //////////////////////////////////////////////////////////////////////
        // Draw the tiles

        draw: function (context) {
            var i;
            for (i = 0; i < this.board.length; ++i) {
                this.board[i].draw(context);
            }
        },

        //////////////////////////////////////////////////////////////////////
        // Get the score for a word

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
        // Find all (horizontal|vertical) words

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
        // Get the tile at a certain index of a word

        getWordTile: function (w, i) {
            var yo = w.orientation,
                xo = 1 - yo;
            return this.board[(w.x + xo * i) + (w.y + yo * i) * this.width];
        },

        //////////////////////////////////////////////////////////////////////
        // Find all the words on the board and return a score

        markAllWords: function () {

            var w,
                i,
                t,
                j;
            words.length = 0;
            foundWords.length = 0;
            this.score = 0;

            // clear the words from the tiles
            for (i = 0; i < this.length; ++i) {
                this.board[i].clearWords();
            }

            // find all words, including overlapping ones
            this.markWordPass(Orientation.horizontal, 1, this.width, 1, 0);
            this.markWordPass(Orientation.vertical, this.width, this.height, 0, 1);

            // sort by score, length, alphabet
            foundWords.sort(function (a, b) {
                return a.compare(b);
            });

            // find the best, non-overlapping ones, discard the others
            while (foundWords.length > 0) {
                w = foundWords[0];
                foundWords.shift();
                for (i = 0; i < w.str.length; ++i) {
                    t = this.getWordTile(w, i);
                    if (t.vertical.word !== null && w.orientation === Orientation.vertical) {
                        break;
                    }
                    if (t.horizontal.word !== null && w.orientation === Orientation.horizontal) {
                        break;
                    }
                }
                if (i === w.str.length) {
                    words.push(w);
                    this.score += w.score;
                    for (j = 0; j < w.str.length; ++j) {
                        this.getWordTile(w, j).setWord(w, j);
                    }
                }
            }
            return this.score;
        }
    };

    //////////////////////////////////////////////////////////////////////

    return Board;
}());