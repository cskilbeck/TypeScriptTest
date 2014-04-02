//////////////////////////////////////////////////////////////////////

var Board = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////
    // private static vars

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

        aToZ = "abcdefghijklmnopqrstuvwxyz",
        distribution = [],
        foundWords = new LinkedList("listNode"),
        words = new LinkedList("listNode"),
        random = new Random(),
        activeTile = null,
        swapTile = null,
        clickX,
        clickY,
        offsetX,
        offsetY,
        i,
        j,

    //////////////////////////////////////////////////////////////////////
    // constructor

        Board = function () {
            this.score = 0;
            this.score = 0;
            this.width = 7;
            this.height = 5;
            this.length = this.width * this.height;
            this.board = [];
            this.board.length = this.length;
        };

    //////////////////////////////////////////////////////////////////////
    // static initialization: init the distribution table

    for (i = 0; i < letters.length; ++i) {
        for (j = 0; j < letters[i].frequency; ++j) {
            distribution.push(i);
        }
    }

    //////////////////////////////////////////////////////////////////////
    // public member functions

    Board.prototype = {

        randomize: function (seed) {
            // make a random board
            random.seed(seed);
            for (i = 0; i < this.board.length; ++i) {
                this.board[i] = new Tile(this.randomLetter(), i % this.width, (i / this.width) >>> 0);
            }

            // nobble it until there are no words on it
            while (this.markAllWords() !== 0) {
                this.getWordTile(words.head(), 0).letter = this.randomLetter();
            }
        },

        //////////////////////////////////////////////////////////////////////
        // Get the board as an ascii string

        toString: function () {
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
        // get the tile at a position on the screen

        tileFromScreenPos: function (x, y) {
            if (x >= 0 && y >= 0 && x < this.width * Tile.width && y < this.height * Tile.height) {
                return this.tile((x / Tile.width) >>> 0, (y / Tile.height) >>> 0);
            }
            return null;
        },

        //////////////////////////////////////////////////////////////////////
        // Get a random letter from the distribution table

        randomLetter: function () {
            return aToZ[distribution[random.next() % distribution.length]];
        },

        //////////////////////////////////////////////////////////////////////
        // update

        update: function (deltaTime) {
            var clickedTile,
                snapX,
                snapY,
                tileX,
                tileY,
                swapLetter;
            if (Mouse.left.released) {
                if (activeTile !== null) {
                    activeTile.reset();
                }
                if (swapTile !== null) {
                    swapTile.reset();
                }
                swapTile = null;
                activeTile = null;
            }
            if (Mouse.left.pressed) {
                clickedTile = this.tileFromScreenPos(Mouse.x, Mouse.y);
                if (clickedTile !== null) {
                    if (activeTile !== null && activeTile !== clickedTile) {
                        activeTile.selected = false;
                        activeTile.layer = 0;
                    }
                    activeTile = clickedTile;
                    clickX = Mouse.x;
                    clickY = Mouse.y;
                    offsetX = clickX - activeTile.pos.x;
                    offsetY = clickY - activeTile.pos.y;
                }
            } else {
                if (Mouse.left.held && activeTile !== null) {
                    activeTile.selected = true;
                    activeTile.layer = 1;
                    tileX = Mouse.x - offsetX;
                    tileY = Mouse.y - offsetY;
                    snapX = Math.floor((tileX + Tile.width / 2) / Tile.width) * Tile.width;
                    snapY = Math.floor((tileY + Tile.height / 2) / Tile.height) * Tile.height;
                    if (Math.abs(tileX - snapX) < Tile.width / 6 && Math.abs(tileY - snapY) < Tile.height / 6) {
                        swapTile = this.tileFromScreenPos(snapX, snapY);
                        if (swapTile !== null) {
                            swapLetter = swapTile.letter;
                            swapTile.letter = activeTile.letter;
                            activeTile.letter = swapLetter;
                            swapTile.selected = true;
                            swapTile.layer = 1;
                            activeTile.reset();
                            activeTile = swapTile;
                            activeTile.setPosition(snapX, snapY);
                            this.markAllWords();
                        }
                    } else {
                        if (swapTile !== null) {
                            swapTile.reset();
                        }
                        swapTile = null;
                        activeTile.setPosition(tileX, tileY);
                    }
                }
            }
        },


        //////////////////////////////////////////////////////////////////////
        // Draw the tiles

        draw: function (context) {
            var layer = 0,
                i,
                drawn = true;
            while (drawn) {
                drawn = false;
                for (i = 0; i < this.board.length; ++i) {
                    if (this.board[i].layer === layer) {
                        this.board[i].draw(context);
                        drawn = true;
                    }
                }
                layer += 1;
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
                            foundWords.pushBack(new Word(string, x, y, orientation, this.getScore(string)));
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

            words.clear();
            foundWords.clear();
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
                return b.compare(a);
            });

            // find the best, non-overlapping ones, discard the others
            while (true) {
                w = foundWords.popFront();
                if (w === null) {
                    break;
                }
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
                    words.pushBack(w);
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