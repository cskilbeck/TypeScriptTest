//////////////////////////////////////////////////////////////////////

var Board = (function () {
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
        foundWords = new LinkedList("listNode"),
        words = new LinkedList("listNode"),
        sortedTiles = new LinkedList("listNode"),
        random = new Random(),
        activeTile = null,
        swapTile = null,
        clickX,
        clickY,
        offsetX,
        offsetY,
        i,
        j,
        undoBuffer = [],    // 255 strings
        undoIndex = 0,      // where the current undo is
        undoHead = 0;       // where to push the next undo

    //////////////////////////////////////////////////////////////////////
    //
    // Get the score for a word

    function getScore(str) {
        var s = 0,
            i;
        for (i = 0; i < str.length; ++i) {
            s += letters[str.charCodeAt(i) - asciiA].score;
        }
        return s * str.length;
    }

    //////////////////////////////////////////////////////////////////////
    // Find all (horizontal|vertical) words

    function markWordPass(orientation, offset, limit, xMul, yMul) {

        var xLim = Board.width - 2 * xMul,
            yLim = Board.height - 2 * yMul,
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
                n = x + y * Board.width;
                t = x * xMul + y * yMul;
                for (e = 3; e + t <= limit; ++e) {
                    m = n;
                    str = "";
                    for (i = 0; i < e; ++i) {
                        str += Board.tiles[m].letter;
                        m += offset;
                    }
                    if (Dictionary.isWord(str)) {
                        foundWords.pushBack(new Word(str, x, y, orientation, getScore(str)));
                    }
                }
            }
        }
    }

    //////////////////////////////////////////////////////////////////////
    // Get a random letter from the distribution table

    function randomLetter() {
        return distribution[random.next() % distribution.length];
    }

    //////////////////////////////////////////////////////////////////////
    // static initialization

    // init the distribution table
    for (i = 0; i < letters.length; ++i) {
        for (j = 0; j < letters[i].frequency; ++j) {
            distribution.push(String.fromCharCode(i + asciiA));
        }
    }

    //////////////////////////////////////////////////////////////////////
    // public static

    return {

        //////////////////////////////////////////////////////////////////////

        width: 7,
        height: 5,
        score: 0,
        tiles: [],

        //////////////////////////////////////////////////////////////////////

        pixelWidth: function () {
            return (Board.width - 1) * Tile.width;
        },

        pixelHeight: function () {
            return (Board.height - 1) * Tile.height;
        },

        //////////////////////////////////////////////////////////////////////
        // fill with random letters which don't make any words

        randomize: function (seed) {

            Board.tiles.length = Board.width * Board.height;
            // make a random board
            random.seed(seed);
            for (i = 0; i < Board.tiles.length; ++i) {
                Board.tiles[i] = new Tile(randomLetter(), i % Board.width, (i / Board.width) >>> 0);
            }

            // add to the list for sorting by layer
            for (i = 0; i < Board.tiles.length; ++i) {
                sortedTiles.pushBack(Board.tiles[i]);
            }

            // nobble it until there are no words on it
            while (Board.markAllWords() !== 0) {
                Board.getWordTile(words.head(), 0).letter = randomLetter();
            }
        },

        //////////////////////////////////////////////////////////////////////
        // Get the board as an ascii string

        toString: function () {
            var i,
                s = "";
            for (i = 0; i < Board.tiles.length; ++i) {
                s += Board.tiles[i].letter;
            }
            return s;
        },

        //////////////////////////////////////////////////////////////////////

        setFromString: function (s) {
            var i;
            for (i = 0; i < Board.tiles.length; ++i) {
                Board.tiles[i].letter = s[i];
            }
            Board.markAllWords();
        },

        //////////////////////////////////////////////////////////////////////
        // Get the tile at x,y

        tile: function (x, y) {
            return Board.tiles[x + y * Board.width];
        },

        //////////////////////////////////////////////////////////////////////
        // get the tile at a position on the screen

        tileFromScreenPos: function (x, y) {
            if (x >= 0 && y >= 0 && x < Board.width * Tile.width && y < Board.height * Tile.height) {
                return Board.tile((x / Tile.width) >>> 0, (y / Tile.height) >>> 0);
            }
            return null;
        },

        //////////////////////////////////////////////////////////////////////

        undo: function () {

        },

        //////////////////////////////////////////////////////////////////////

        redo: function () {

        },

        //////////////////////////////////////////////////////////////////////
        // update

        update: function () {
            var clickedTile,
                snapX,
                snapY,
                tileX,
                tileY,
                newSwapTile,
                y;
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
                clickedTile = Board.tileFromScreenPos(Mouse.x, Mouse.y);
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
                    activeTile.selected = true;
                }
            } else {
                if (Mouse.left.held && activeTile !== null) {
                    activeTile.selected = true;
                    activeTile.layer = 1;
                    tileX = Util.constrain(Mouse.x - offsetX, 0, Board.pixelWidth());
                    tileY = Util.constrain(Mouse.y - offsetY, 0, Board.pixelHeight());
                    snapX = Math.floor((tileX + Tile.width / 2) / Tile.width) * Tile.width;
                    snapY = Math.floor((tileY + Tile.height / 2) / Tile.height) * Tile.height;
                    if (Math.abs(tileX - snapX) < Tile.width / 3 && Math.abs(tileY - snapY) < Tile.height / 3) {
                        newSwapTile = Board.tileFromScreenPos(snapX, snapY);
                        if (newSwapTile !== null && newSwapTile !== activeTile) {
                            if (swapTile === null && swapTile !== activeTile) {
                                swapTile = activeTile;
                                swapTile.swapped = true;
                            }
                            newSwapTile.swap(activeTile);
                            activeTile.reset();
                            if (swapTile !== newSwapTile) {
                                activeTile.swap(swapTile);
                                swapTile.swapped = true;
                            }
                            activeTile = newSwapTile;
                            activeTile.setPosition(snapX, snapY);
                            Board.markAllWords();
                            activeTile.selected = true;
                            activeTile.layer = 1;
                        } else {
                            activeTile.setPosition(snapX, snapY);
                        }
                    } else {
                        activeTile.setPosition(tileX, tileY);
                    }
                }
            }
            y = 20;
            Debug.text(680, y, "Score: " + Board.score.toString());
            y += 20;
            words.forEach(function (w) {
                Debug.text(680, y, w.toString());
                y += 15;
            });
        },

        //////////////////////////////////////////////////////////////////////
        // Draw the tiles, sorted by layer

        draw: function (context) {

            sortedTiles.sort(function (a, b) {
                return b.layer - a.layer;
            });

            sortedTiles.forEach(function (t) {
                t.draw(context);
            });
        },

        //////////////////////////////////////////////////////////////////////
        // Get the tile at a certain index of a word

        getWordTile: function (w, i) {
            var yo = w.orientation,
                xo = 1 - yo;
            return Board.tiles[(w.x + xo * i) + (w.y + yo * i) * Board.width];
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
            Board.score = 0;

            // clear the words from the tiles
            for (i = 0; i < Board.tiles.length; ++i) {
                Board.tiles[i].clearWords();
            }

            // find all words, including overlapping ones
            markWordPass(Orientation.horizontal, 1, Board.width, 1, 0);
            markWordPass(Orientation.vertical, Board.width, Board.height, 0, 1);

            // sort by score, length, alphabet
            foundWords.sort(function (a, b) {
                var c,
                    al,
                    bl,
                    x,
                    y;
                if (a.score > b.score) {
                    return 1;
                }
                if (a.score < b.score) {
                    return -1;
                }
                al = a.str.length;
                bl = b.str.length;
                if (al > bl) {
                    return 1;
                }
                if (al < bl) {
                    return -1;
                }
                for (c = 0; c < al; ++c) {
                    x = a.str.charCodeAt(c);
                    y = b.str.charCodeAt(c);
                    if (x < y) {
                        return 1;
                    }
                    if (x > y) {
                        return -1;
                    }
                }
                return 0;
            });

            // find the best, non-overlapping ones, discard the others
            while (!foundWords.empty()) {
                w = foundWords.popFront();
                for (i = 0; i < w.str.length; ++i) {
                    t = Board.getWordTile(w, i);
                    if (t.vertical.word !== null && w.orientation === Orientation.vertical) {
                        break;
                    }
                    if (t.horizontal.word !== null && w.orientation === Orientation.horizontal) {
                        break;
                    }
                }
                if (i === w.str.length) {
                    words.pushBack(w);
                    Board.score += w.score;
                    for (j = 0; j < w.str.length; ++j) {
                        Board.getWordTile(w, j).setWord(w, j);
                    }
                }
            }
            return Board.score;
        }
    };
}());
