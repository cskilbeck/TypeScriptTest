//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    mtw.Board = chs.Class({

        $: function (tileType, mainBoard) {
            var i,
                tt = tileType !== undefined ? tileType : 'Tile';

            this.tileWidth = 7;
            this.tileHeight = 5;
            this.score = 0;
            this.seed = 0;
            this.words = [];
            this.random = new chs.Random();
            this.tiles = [];
            this.tiles.length = this.tileWidth * this.tileHeight;
            for (i = 0; i < this.tiles.length; ++i) {
                this.tiles[i] = new mtw[tt]("A", i % this.tileWidth, (i / this.tileWidth) >>> 0, mainBoard);
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
                this.tiles[i].letter = mtw.Letters.random(this.random);
            }

            // nobble it until there are no words on it
            while (this.markAllWords() !== 0) {
                this.getWordTile(this.words[0], 0).letter = mtw.Letters.random(this.random);
            }
        },

        //////////////////////////////////////////////////////////////////////
        // Get the board as an ascii string

        getAsString: function () {
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
        // Get the tile at a certain index of a word

        getWordTile: function (w, i) {
            var yo = w.orientation,
                xo = 1 - yo;
            return this.tiles[(w.x + xo * i) + (w.y + yo * i) * this.tileWidth];
        },

        //////////////////////////////////////////////////////////////////////
        // Find all the words on the board and return a score

        // this finds all [horizontal or vertical] words

        markWordPass: function (orientation, offset, limit, xMul, yMul, list) {

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
                            list.push(new mtw.Word(str, x, y, orientation));
                        }
                    }
                }
            }
        },

        markAllWords: function () {

            var w,
                i,
                l,
                t,
                j,
                k,
                foundWords = [];

            this.changed = true;
            this.words = [];
            this.score = 0;

            // clear the words from the tiles
            for (i = 0; i < this.tiles.length; ++i) {
                this.tiles[i].clearWords();
            }

            // find all words, including overlapping ones
            this.markWordPass(mtw.Word.horizontal, 1, this.tileWidth, 1, 0, foundWords);
            this.markWordPass(mtw.Word.vertical, this.tileWidth, this.tileHeight, 0, 1, foundWords);

            // sort by score, length, alphabet
            foundWords.sort(function (a, b) {
                return a.score > b.score ? -1 :
                        a.score < b.score ? 1 :
                        a.str.length > b.str.length ? -1 :
                        a.str.length < b.str.length ? 1 :
                        -b.str.localeCompare(a.str);
            });

            // find the best, non-overlapping ones, discard the others
            for (k = 0, l = foundWords.length; k < l; ++k) {
                w = foundWords[k];
                for (i = 0; i < w.str.length; ++i) {
                    t = this.getWordTile(w, i);
                    if (t.hasVerticalWord && w.orientation === mtw.Word.vertical) {
                        break;
                    }
                    if (t.hasHorizontalWord && w.orientation === mtw.Word.horizontal) {
                        break;
                    }
                }
                if (i === w.str.length) {
                    this.words.push(w);
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
