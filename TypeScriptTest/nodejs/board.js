//////////////////////////////////////////////////////////////////////

mtw.Board = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////
    // private static

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
        distribution = [],
        undoMax = 1000,
        foundWords = new chs.List("listNode"),
        clickedTile,
        snapX,
        snapY,
        tileX,
        tileY,
        newSwapTile,
        y;


    //////////////////////////////////////////////////////////////////////
    // Get a random letter from the distribution table

    function randomLetter(random) {
        return distribution[random.next() % distribution.length];
    }

    //////////////////////////////////////////////////////////////////////
    // static initialization

    // init the distribution table
    (function () {
        var i,
            j;
        for (i = 0; i < letters.length; ++i) {
            for (j = 0; j < letters[i].frequency; ++j) {
                distribution.push(String.fromCharCode(i + asciiA));
            }
        }
    }());

    //////////////////////////////////////////////////////////////////////

    return chs.Class({

        static$: {

            getWordScore: function (str) {
                var s = 0,
                    i;
                for (i = 0; i < str.length; ++i) {
                    s += letters[str.charCodeAt(i) - asciiA].score;
                }
                return s * str.length;
            }

        },

        $: function (x, y, game) {
            var i;

            this.tileWidth = 7;
            this.tileHeight = 5;
            this.score = 0;
            this.seed = 0;
            this.words = new chs.List("listNode");
            this.random = new chs.Random();
            this.tiles = [];
            this.tiles.length = this.tileWidth * this.tileHeight;
            for (i = 0; i < this.tiles.length; ++i) {
                this.tiles[i] = new mtw.Tile("A", i % this.tileWidth, (i / this.tileWidth) >>> 0);
            }
        },

        //////////////////////////////////////////////////////////////////////
        // fill with random letters which don't make any words

        randomize: function (seed) {
            var i;

            this.seed = seed;
            // fill with random letters
            this.random.seed(seed);
            for (i = 0; i < this.tiles.length; ++i) {
                this.tiles[i].letter = randomLetter(this.random);
            }

            // nobble it until there are no words on it
            while (this.markAllWords() !== 0) {
                this.getWordTile(this.words.head(), 0).letter = randomLetter(this.random);
            }
        },

        //////////////////////////////////////////////////////////////////////
        // Get the board as an ascii string

        toString: function () {
            var i,
                s = "";
            for (i = 0; i < this.tiles.length; ++i) {
                s += this.tiles[i].letter;
            }
            return s;
        },

        //////////////////////////////////////////////////////////////////////

        setFromString: function (s) {
            var i;
            for (i = 0; i < this.tiles.length; ++i) {
                this.tiles[i].letter = s[i];
            }
            this.markAllWords();
        },

        //////////////////////////////////////////////////////////////////////
        // Get the tile at x,y

        tile: function (x, y) {
            return this.tiles[x + y * this.tileWidth];
        },

        //////////////////////////////////////////////////////////////////////

        wordList: function () {
            return this.words;
        },

        //////////////////////////////////////////////////////////////////////
        // Get the tile at a certain index of a word

        getWordTile: function (w, i) {
            var yo = w.orientation,
                xo = 1 - yo;
            return this.tiles[(w.x + xo * i) + (w.y + yo * i) * this.tileWidth];
        },

        //////////////////////////////////////////////////////////////////////
        // Find all the words on the board and return a score

        markWordPass: function (orientation, offset, limit, xMul, yMul) {

            var xLim = this.tileWidth - 2 * xMul,
                yLim = this.tileHeight - 2 * yMul,
                y,
                x,
                n,
                t,
                e,
                m,
                i,
                str;

            for (y = 0; y < yLim; ++y) {
                for (x = 0; x < xLim; ++x) {
                    n = x + y * this.tileWidth;
                    t = x * xMul + y * yMul;
                    for (e = 3; e + t <= limit; ++e) {
                        m = n;
                        str = "";
                        for (i = 0; i < e; ++i) {
                            str += this.tiles[m].letter;
                            m += offset;
                        }
                        if (mtw.Dictionary.isWord(str)) {
                            foundWords.pushBack(new mtw.Word(str, x, y, orientation, mtw.Board.getWordScore(str)));
                        }
                    }
                }
            }
        },

        markAllWords: function () {

            var w,
                i,
                t,
                j;

            foundWords.clear();

            this.changed = true;
            this.words.clear();
            this.score = 0;

            // clear the words from the tiles
            for (i = 0; i < this.tiles.length; ++i) {
                this.tiles[i].clearWords();
            }

            // find all words, including overlapping ones
            this.markWordPass(mtw.Word.horizontal, 1, this.tileWidth, 1, 0);
            this.markWordPass(mtw.Word.vertical, this.tileWidth, this.tileHeight, 0, 1);

            // sort by score, length, alphabet
            foundWords.sort(function (a, b) {
                return a.score > b.score ? 1 :
                        a.score < b.score ? -1 :
                        a.str.length > b.str.length ? 1 :
                        a.str.length < b.str.length ? -1 :
                        b.str.localeCompare(a.str);
            });

            // find the best, non-overlapping ones, discard the others
            while (!foundWords.empty()) {
                w = foundWords.popFront();
                for (i = 0; i < w.str.length; ++i) {
                    t = this.getWordTile(w, i);
                    if (t.vertical.word !== null && w.orientation === mtw.Word.vertical) {
                        break;
                    }
                    if (t.horizontal.word !== null && w.orientation === mtw.Word.horizontal) {
                        break;
                    }
                }
                if (i === w.str.length) {
                    this.words.pushBack(w);
                    this.score += w.score;
                    for (j = 0; j < w.str.length; ++j) {
                        this.getWordTile(w, j).setWord(w, j);
                    }
                }
            }
            return this.score;
        }
    });

}());
