//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////
    // private static

    var undoMax = 1000,
        foundWords = new chs.List("listNode"),
        clickedTile,
        snapX,
        snapY,
        tileX,
        tileY,
        newSwapTile,
        y;

    //////////////////////////////////////////////////////////////////////

    mtw.BoardGame = chs.Class({ inherit$: [mtw.Board, chs.Drawable],

        $: function (x, y, game, mainBoard) {
            var i;

            mtw.Board.call(this, 'BoardTile', mainBoard);
            chs.Drawable.call(this);
            this.size = {
                width: this.tileWidth * mtw.BoardTile.width,
                height: this.tileHeight * mtw.BoardTile.height
            };
            this.setPosition(x, y);
            this.bestScore = 0;
            this.bestBoard = "";
            this.bestSeed = 0;
            this.changed = false;
            this.activeTile = null;
            this.swapTile = null;
            this.clickX = 0;
            this.clickY = 0;
            this.offsetX = 0;
            this.offsetY = 0;
            this.undoStack = [];
            this.undoPointer = 0;
            this.undoLength = 0;
            this.beforeDrag = "";
            this.mainBoard = mainBoard;
            for (i = 0; i < this.tiles.length; ++i) {
                this.addChild(this.tiles[i], mainBoard);
            }
        },

        //////////////////////////////////////////////////////////////////////

        pixelWidth: function () {
            return this.width - mtw.BoardTile.width;
        },

        pixelHeight: function () {
            return this.height - mtw.BoardTile.height;
        },

        //////////////////////////////////////////////////////////////////////
        // get the tile at a position on the screen

        tileFrom: function (pos) {
            if (pos.x >= 0 && pos.y >= 0 && pos.x < this.width && pos.y < this.height) {
                return this.tile((pos.x / mtw.BoardTile.width) >>> 0, (pos.y / mtw.BoardTile.height) >>> 0);
            }
            return null;
        },

        //////////////////////////////////////////////////////////////////////

        load: function () {
            var b;
            if (parseInt(chs.Cookies.get("game"), 10) === this.seed) {
                b = chs.Cookies.get("board");
                if (b !== null) {
                    this.setFromString(b);
                }
                if (parseInt(chs.Cookies.get("bestSeed"), 10) === this.seed) {
                    b = chs.Cookies.get("best");
                    if (b !== null) {
                        this.bestBoard = b;
                    }
                    b = chs.Cookies.get("bestScore");
                    if (b !== null) {
                        this.bestScore = parseInt(b, 10);
                    }
                }
            }
            this.saveBest();
        },

        //////////////////////////////////////////////////////////////////////

        save: function () {
            if (this.mainBoard) {
                chs.Cookies.set("game", this.seed, 10);
                chs.Cookies.set("board", this.getAsString(), 10);
                chs.Cookies.set("best", this.bestBoard, 10);
                chs.Cookies.set("bestScore", this.bestScore, 10);
                chs.Cookies.set("bestSeed", this.bestSeed, 10);
            }
        },

        //////////////////////////////////////////////////////////////////////

        saveBest: function () {
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                this.bestBoard = this.getAsString();
                this.bestSeed = this.seed;
            }
        },

        //////////////////////////////////////////////////////////////////////

        pushUndo: function () {
            if(this.beforeDrag.length > 0) {
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
                this.undoStack.push(this.getAsString());
                this.undoPointer = this.undoStack.length - 1;
                this.save();
            }
        },

        //////////////////////////////////////////////////////////////////////

        undo: function () {
            if (this.undoPointer > 0) {
                this.undoPointer -= 1;
                this.setFromString(this.undoStack[this.undoPointer]);
                this.beforeDrag = this.getAsString();
                this.markAllWords();
                this.save();
            }
        },

        //////////////////////////////////////////////////////////////////////

        redo: function () {
            if (this.undoPointer < this.undoStack.length - 1) {
                this.undoPointer += 1;
                this.setFromString(this.undoStack[this.undoPointer]);
                this.beforeDrag = this.getAsString();
                this.markAllWords();
                this.save();
            }
        },

        //////////////////////////////////////////////////////////////////////

        doClick: function(e) {
            if (this.mainBoard) {
                var pos = this.screenToClient(e.position);
                clickedTile = this.tileFrom(pos);
                if (clickedTile !== null) {
                    if (this.activeTile !== null) {
                        this.activeTile.selected = false;
                        this.activeTile = null;
                    }
                    this.activeTile = clickedTile;
                    this.activeTile.zIndex = 1;
                    this.activeTile.selected = true;
                    this.clickX = pos.x;
                    this.clickY = pos.y;
                    this.offsetX = this.clickX - this.activeTile.position.x;
                    this.offsetY = this.clickY - this.activeTile.position.y;
                    this.beforeDrag = this.getAsString();
                    this.setCapture(true);
                }
            }
        },

        //////////////////////////////////////////////////////////////////////

        doUnclick: function (e) {
            if (this.mainBoard) {
                if (this.activeTile !== null) {
                    this.activeTile.reset();
                }
                if (this.swapTile !== null) {
                    this.swapTile.reset();
                }
                this.swapTile = null;
                this.activeTile = null;

                if (this.beforeDrag !== this.getAsString()) {
                    this.pushUndo();
                }
                this.setCapture(false);
                this.dispatchEvent("movecomplete");
            }
        },

        //////////////////////////////////////////////////////////////////////

        doMove: function (e) {
            var pos,
                oldx,
                oldy,
                tw = mtw.BoardTile.width,
                th = mtw.BoardTile.height;
            if (this.activeTile !== null) {
                pos = this.screenToClient(e.position);
                this.activeTile.selected = true;
                this.activeTile.zIndex = 1;
                tileX = chs.Util.constrain(pos.x - this.offsetX, tw / 2, this.pixelWidth() + tw / 2);
                tileY = chs.Util.constrain(pos.y - this.offsetY, th / 2, this.pixelHeight() + th / 2);
                snapX = Math.floor(tileX / tw) * tw + tw / 2;
                snapY = Math.floor(tileY / th) * th + th / 2;
                if (Math.abs(tileX - snapX) < tw / 3 && Math.abs(tileY - snapY) < th / 3) {
                    newSwapTile = this.tileFrom({ x: snapX, y: snapY });
                    if (newSwapTile !== null && newSwapTile !== this.activeTile) {
                        if (this.swapTile === null && this.swapTile !== this.activeTile) {
                            this.swapTile = this.activeTile;
                            this.swapTile.swapped = true;
                        }
                        newSwapTile.swap(this.activeTile);
                        newSwapTile.x = this.activeTile.x;
                        newSwapTile.y = this.activeTile.y;
                        this.activeTile.reset();
                        if (this.swapTile !== newSwapTile) {
                            this.activeTile.swap(this.swapTile);
                            this.swapTile.swapped = true;
                        }
                        this.activeTile = newSwapTile;
                        this.activeTile.setTarget(snapX, snapY, 50);
                        this.markAllWords();
                        this.saveBest();
                        this.activeTile.selected = true;
                        this.activeTile.zIndex = 1;
                        this.dispatchEvent("changed");
                    } else {
                        this.activeTile.setTarget(snapX, snapY);
                    }
                } else {
                    this.activeTile.setTarget(tileX, tileY);
                }
            }
        },

        //////////////////////////////////////////////////////////////////////

        onLeftMouseDown: function (e) {
            this.doClick(e);
        },

        //////////////////////////////////////////////////////////////////////

        onLeftMouseUp: function (e) {
            this.doUnclick(e);
        },

        //////////////////////////////////////////////////////////////////////
        // this is fucked

        onMouseMove: function (e) {
            this.doMove(e);
        },

        //////////////////////////////////////////////////////////////////////

        onTouchStart: function (e) {
            this.doClick(e);
        },

        //////////////////////////////////////////////////////////////////////

        onTouchEnd: function (e) {
            this.doUnclick(e);
        },

        //////////////////////////////////////////////////////////////////////
        // this is fucked

        onTouchMove: function (e) {
            this.doMove(e);
        }

    });

}());
