//////////////////////////////////////////////////////////////////////

Board = (function () {
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

    return chs.Class({ inherits: chs.Drawable,

        statics: {

            getWordScore: function (str) {
                var s = 0,
                    i;
                for (i = 0; i < str.length; ++i) {
                    s += letters[str.charCodeAt(i) - asciiA].score;
                }
                return s * str.length;
            }

        },

        ctor: function (game) {
            var i;

            chs.Drawable.call(this);
            this.tileWidth = 7;
            this.tileHeight = 5;
            this.score = 0;
            this.changed = false;
            this.words = new chs.List("listNode");
            this.random = new chs.Random();
            this.activeTile = null;
            this.swapTile = null;
            this.clickX = 0;
            this.clickY = 0;
            this.offsetX = 0;
            this.offsetY = 0;
            this.tiles = [];
            this.undoStack = [];
            this.undoPointer = 0;
            this.undoLength = 0;
            this.seed = 0;
            this.beforeDrag = "";
            this.tiles.length = this.tileWidth * this.tileHeight;
            for (i = 0; i < this.tiles.length; ++i) {
                this.tiles[i] = new Tile("A", i % this.tileWidth, (i / this.tileWidth) >>> 0);
                game.addChild(this.tiles[i]);
            }
        },

        methods: {

            //////////////////////////////////////////////////////////////////////

            size: function () {
                return { width: this.tileWidth * Tile.width, height: this.tileHeight * Tile.height };
            },

            //////////////////////////////////////////////////////////////////////

            pixelWidth: function () {
                return this.width - Tile.width;
            },

            pixelHeight: function () {
                return this.height - Tile.height;
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
                this.undoStack = [];
                this.undoPointer = 0;
                this.undoLength = 0;
                this.beforeDrag = this.toString();
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
            // get the tile at a position on the screen

            tileFromScreenPos: function (x, y) {
                if (x >= 0 && y >= 0 && x < this.width && y < this.height) {
                    return this.tile((x / Tile.width) >>> 0, (y / Tile.height) >>> 0);
                }
                return null;
            },

            //////////////////////////////////////////////////////////////////////

            wordList: function () {
                return this.words;
            },

            //////////////////////////////////////////////////////////////////////

            pushUndo: function () {
                if (this.undoStack.length > undoMax) {
                    this.undoStack.shift();
                }
                this.undoPointer = Math.min(this.undoPointer, this.undoStack.length - 1);
                if (this.undoPointer < this.undoStack.length - 1) {
                    this.undoStack = this.undoStack.slice(0, this.undoPointer);
                } else {
                    this.undoStack.pop();
                }
                this.undoStack.push(this.beforeDrag);
                this.undoStack.push(this.toString());
                this.undoPointer = this.undoStack.length - 1;
                chs.Cookies.set("game", this.seed, 10);
                chs.Cookies.set("board", this.toString(), 10);
            },

            //////////////////////////////////////////////////////////////////////

            undo: function () {
                if (this.undoPointer > 0) {
                    this.undoPointer -= 1;
                    this.setFromString(this.undoStack[this.undoPointer]);
                    this.beforeDrag = this.toString();
                    this.markAllWords();
                    chs.Cookies.set("game", this.seed, 10);
                    chs.Cookies.set("board", this.toString(), 10);
                }
            },

            //////////////////////////////////////////////////////////////////////

            redo: function () {
                if (this.undoPointer < this.undoStack.length - 1) {
                    this.undoPointer += 1;
                    this.setFromString(this.undoStack[this.undoPointer]);
                    this.beforeDrag = this.toString();
                    this.markAllWords();
                    chs.Cookies.set("game", this.seed, 10);
                    chs.Cookies.set("board", this.toString(), 10);
                }
            },

            //////////////////////////////////////////////////////////////////////

            onLeftMouseDown: function (e) {
                clickedTile = this.tileFromScreenPos(e.position.x, e.position.y);
                if (clickedTile !== null) {
                    if (this.activeTile !== null) {
                        this.activeTile.selected = false;
                        this.activeTile = null;
                    }
                    this.activeTile = clickedTile;
                    this.activeTile.zIndex = 1;
                    this.activeTile.selected = true;
                    this.clickX = e.position.x;
                    this.clickY = e.position.y;
                    this.offsetX = this.clickX - this.activeTile.position.x;
                    this.offsetY = this.clickY - this.activeTile.position.y;
                    this.beforeDrag = this.toString();
                    this.setCapture(true);
                }
            },

            //////////////////////////////////////////////////////////////////////

            onLeftMouseUp: function () {
                if (this.activeTile !== null) {
                    this.activeTile.reset();
                }
                if (this.swapTile !== null) {
                    this.swapTile.reset();
                }
                this.swapTile = null;
                this.activeTile = null;

                if (this.beforeDrag !== this.toString()) {
                    this.pushUndo();
                }
                this.setCapture(false);
            },

            //////////////////////////////////////////////////////////////////////
            // this is fucked

            onMouseMove: function (e) {
                if (this.activeTile !== null) {
                    this.activeTile.selected = true;
                    this.activeTile.zIndex = 1;
                    tileX = chs.Util.constrain(e.position.x - this.offsetX, Tile.width / 2, this.pixelWidth() + Tile.width / 2);
                    tileY = chs.Util.constrain(e.position.y - this.offsetY, Tile.height / 2, this.pixelHeight() + Tile.height / 2);
                    snapX = Math.floor(tileX / Tile.width) * Tile.width + Tile.width / 2;
                    snapY = Math.floor(tileY / Tile.height) * Tile.height + Tile.height / 2;
                    if (Math.abs(tileX - snapX) < Tile.width / 3 && Math.abs(tileY - snapY) < Tile.height / 3) {
                        newSwapTile = this.tileFromScreenPos(snapX, snapY);
                        if (newSwapTile !== null && newSwapTile !== this.activeTile) {
                            if (this.swapTile === null && this.swapTile !== this.activeTile) {
                                this.swapTile = this.activeTile;
                                this.swapTile.swapped = true;
                            }
                            newSwapTile.swap(this.activeTile);
                            this.activeTile.reset();
                            if (this.swapTile !== newSwapTile) {
                                this.activeTile.swap(this.swapTile);
                                this.swapTile.swapped = true;
                            }
                            this.activeTile = newSwapTile;
                            this.activeTile.setPosition(snapX, snapY);
                            this.markAllWords();
                            this.activeTile.selected = true;
                            this.activeTile.zIndex = 1;
                        } else {
                            this.activeTile.setPosition(snapX, snapY);
                        }
                    } else {
                        this.activeTile.setPosition(tileX, tileY);
                    }
                }
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
                            if (Dictionary.isWord(str)) {
                                foundWords.pushBack(new Word(str, x, y, orientation, Board.getWordScore(str)));
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
                this.markWordPass(Word.Orientation.horizontal, 1, this.tileWidth, 1, 0);
                this.markWordPass(Word.Orientation.vertical, this.tileWidth, this.tileHeight, 0, 1);

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
                        if (t.vertical.word !== null && w.orientation === Word.Orientation.vertical) {
                            break;
                        }
                        if (t.horizontal.word !== null && w.orientation === Word.Orientation.horizontal) {
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
        }
    });

}());
