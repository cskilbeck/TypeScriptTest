//////////////////////////////////////////////////////////////////////
// different sized boards
// zoom in / out
// scrolling / pivot point on the player?
// ? moving poison / enemies?
// motion bug when you clip the end of a platform and the player drops vertically down
// ?different keys for run & jump?
// run (& rotate) in both directions?

//////////////////////////////////////////////////////////////////////

function main(desktop) {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var board_width = 20,
        board_height = 20,
        cell_width = 24,
        cell_height = 24,
        gravity = 0.005,
        run_speed = 0.5,
        jump_impulse = 0.84,
        board_size = board_width * board_height,
        colours = [
            "white",
            "rgb(0,112,0)",     // 1: green: platform
            "rgb(255,0,0)",     // 2: red: poison
            "rgb(0,0,255)",     // 3: blue: gem
            "rgb(255,192,0)",   // 4: yellow: exit
            "rgb(192,192,192)"  // 5: start position
        ],
        descriptions = [
            "space",
            "platform",
            "poison",
            "gem",
            "exit",
            "start"
        ],
        offsets = [
            [0, 0],
            [cell_width - 1, 0],
            [0, cell_height - 1],
            [cell_width - 1, cell_height - 1]
        ],

        empty_cell = 0,
        platform_cell = 1,
        poison_cell = 2,
        gem_cell = 3,
        exit_cell = 4,
        start_cell = 5,

        lerpTime = 400,
        sq22 = Math.sqrt(2) / 2;

    //////////////////////////////////////////////////////////////////////

    function fmod(x, y) {
        return x - ((x / y) >>> 0) * y;
    }

    //////////////////////////////////////////////////////////////////////

    function round_up(x, y) {
        return (((x + y - 1) / y) >>> 0) * y;
    }

    //////////////////////////////////////////////////////////////////////

    function round_down(x, y) {
        return ((x / y) >>> 0) * y;
    }

    //////////////////////////////////////////////////////////////////////

    function reset_colours() {
        colours[exit_cell] = "rgb(255,192,0)";
    }

    //////////////////////////////////////////////////////////////////////
    // the player

    var Player = chs.Class({ inherit$: chs.Drawable,

        $: function(board) {
            chs.Drawable.call(this);
            this.width = cell_width;
            this.height = cell_height;
            this.setPosition(cell_width, cell_height);
            this.board = board;
            this.alive = false;
            this.reset();
        },

        reset: function(x, y) {
            this.gemsCollected = 0;
            this.standing = false;
            this.flying = false;
            this.jump = false;
            this.xvel = 0;
            this.yvel = 0;
            this.space = false;
            this.colour = "black";
            this.visible = true;
            this.setPosition(x * cell_width, y * cell_height);
            this.state = this.play;
            this.alive = true;
        },

        onKeyDown: function(e) {
            if (!this.board.flip) {
                this.space = e.name === 'space';
                this.jump = false;
            }
        },

        onKeyUp: function(e) {
            if (e.name === 'space') {
                this.jump = this.space;
                this.space = false;
            }
        },

        check: function(xpos, ypos, value) {
            var mask = 0,
                i,
                bit = 1;
            for (i = 0; i < 4; ++i) {
                if (this.board.get_cell_from_pixel_position(xpos + offsets[i][0], ypos + offsets[i][1]) === value) {
                    mask += bit;
                }
                bit <<= 1;
            }
            return mask;
        },

        // this is a bloody silly way to do it
        // instead, double the resolution of the grid
        //   and create a border of platform cells around the real ones
        //   then use a single point for the player
        // or... make a per-pixel collision mask and do it properly...

        move: function(deltaTime) {
            var nx = this.x + this.xvel * deltaTime,
                ny = this.y + this.yvel * deltaTime,
                ox,
                oy,
                wasFlying = this.flying,
                mask = this.check(nx, ny, platform_cell);
            switch(mask) {
                case 0:
                    break;
                case 1:
                    ox = fmod(nx, cell_width);
                    oy = fmod(ny, cell_height);
                    if (ox > oy) {
                        nx = round_up(nx, cell_width);
                        this.xvel = 0;
                    } else {
                        ny = round_up(ny, cell_height);
                        this.yvel = 0;
                    }
                    break;
                case 2:
                    ox = fmod(nx + cell_width - 1, cell_width);
                    oy = (cell_height - 1) - fmod(ny, cell_height);
                    if (ox < oy) {
                        nx = round_down(nx, cell_width);    // !!!
                        this.xvel = 0;
                        this.yvel = 0;
                        this.jump = false;
                        this.space = false;
                        this.board.flip = true;
                    } else {
                        ny = round_up(ny, cell_height);
                        this.yvel = 0;
                    }
                    break;
                case 3:
                    ny = round_up(ny, cell_height);
                    this.yvel = 0;
                    break;
                case 4:
                    ox = fmod(nx, cell_width);
                    oy = (cell_height - 1) - fmod(ny, cell_height);
                    if (ox > oy) {
                        nx = round_up(nx, cell_width);
                        this.xvel = 0;
                    } else {
                        ny = round_down(ny, cell_height);
                        this.yvel = 0;
                        this.flying = false;
                    }
                    break;
                case 5:
                    nx = round_up(nx, cell_width);
                    this.xvel = 0;
                    break;
                case 6:
                    if (this.xvel * sq22 - this.yvel * sq22 > 0) {
                        nx = round_down(nx, cell_width);
                        ny = round_down(ny, cell_height);
                    } else {
                        nx = round_up(nx, cell_width);
                        ny = round_up(ny, cell_height);
                    }
                    this.xvel = 0;
                    this.yvel = 0;
                    break;
                case 7:
                    nx = round_up(nx, cell_width);
                    ny = round_up(ny, cell_height);
                    this.xvel = 0;
                    this.yvel = 0;
                    break;
                case 8:
                    ox = fmod(nx + cell_width - 1, cell_width);
                    oy = fmod(ny + cell_height - 1, cell_height);
                    if (oy > ox) {
                        nx = round_down(nx, cell_width);    // !!!
                        this.xvel = 0;
                        this.yvel = 0;
                        this.jump = false;
                        this.space = false;
                        this.board.flip = true;
                    } else {
                        ny = round_down(ny, cell_height);
                        this.yvel = 0;
                        this.flying = false;
                    }
                    break;
                case 9:
                    if (this.xvel * sq22 + this.yvel * sq22 > 0) {
                        nx = round_down(nx, cell_width);
                        ny = round_up(ny, cell_height);
                    } else {
                        nx = round_up(nx, cell_width);
                        ny = round_down(ny, cell_height);
                    }
                    this.xvel = 0;
                    this.yvel = 0;
                    break;
                case 10:
                    nx = round_down(nx, cell_width);    // !!!
                    this.xvel = 0;
                    this.yvel = 0;
                    this.jump = false;
                    this.space = false;
                    this.board.flip = true;
                    break;
                case 11:
                    nx = round_down(nx, cell_width);    // !!!
                    ny = round_up(ny, cell_height);
                    this.xvel = 0;
                    this.yvel = 0;
                    this.board.flip = true;
                    break;
                case 12:
                    ny = round_down(ny, cell_height);
                    this.yvel = 0;
                    this.flying = false;
                    break;
                case 13:
                    nx = round_up(nx, cell_width);
                    ny = round_down(ny, cell_height);
                    this.xvel = 0;
                    this.yvel = 0;
                    this.flying = false;
                    break;
                case 14:
                    nx = round_down(nx, cell_width);    // !!!
                    ny = round_down(ny, cell_height);
                    this.xvel = 0;
                    this.yvel = 0;
                    this.board.flip = true;
                    this.flying = false;
                    break;
                case 15:
                    nx = this.x;
                    ny = this.y;
                    this.xvel = 0;
                    this.yvel = 0;
                    this.flying = false;
                    break;
            }
            this.x = nx;
            this.y = ny;
            if (this.flying) {
                this.space = false;
            } else if (wasFlying) {
                this.xvel = 0;
                this.jump = false;
                this.space = false;
            }
            return mask;
        },

        state: chs.Property({
            set: function(stateFunction) {
                this.onUpdate = stateFunction;
                this.stateBegan = chs.Timer.time;
            }
        }),

        stateTime: chs.Property({
            get: function () {
                return chs.Timer.time - this.stateBegan;
            }
        }),

        gameover: function() {
            this.dispatchEvent("gameover");
            this.alive = false;
            reset_colours();
        },

        die: function(time, deltaTime) {
            if (this.stateTime > 1000) {
                this.gameover();
            } else {
                this.visible = !this.visible;
            }
        },

        exit: function(time, deltaTime) {
            var t;
            if (this.stateTime > 500) {
                this.gameover();
            } else {
                t = chs.Util.ease2(Math.min(1, this.stateTime / 250), 6);
                this.x = this.orgX + (this.targetX - this.orgX) * t;
                this.y = this.orgY + (this.targetY - this.orgY) * t;
            }
        },

        play: function(time, deltaTime) {
            var dt = Math.min(1000/10, deltaTime),
                of = this.flip,
                mask,
                i,
                u,
                v,
                firstMask;
            if (this.board.flip && !of) {
                this.jump = false;
                this.space = false;
                this.flying = false;
                this.xvel = 0;
                this.yvel = 0;
            }
            else if (!this.board.flip) {
                if (this.space) {
                    this.xvel = run_speed;
                } else if (this.jump) {
                    this.xvel = run_speed;
                    this.yvel = -jump_impulse;
                    this.jump = false;
                    this.flying = true;
                }
                this.yvel += gravity * dt;
                mask = 0;
                while (dt > 0) {
                    mask |= this.move(Math.min(dt, 1));
                    dt -= 1;
                }
                if (mask === 0) {
                    this.flying = true;
                }

                for(i = 0; i < 4; i += 1) {
                    u = this.x + offsets[i][0];
                    v = this.y + offsets[i][1];
                    switch(this.board.get_cell_from_pixel_position(u, v)) {
                        case gem_cell:
                            this.board.set_cell_from_pixel_position(u, v, empty_cell);
                            this.gemsCollected += 1;
                            break;
                        case poison_cell:
                            this.state = this.die;
                            this.colour = "rgb(128,128,128)";
                            break;
                        case exit_cell:
                            if (this.gemsCollected >= this.board.gemsRequired) {
                                this.targetX = round_down(u, cell_width);
                                this.targetY = round_down(v, cell_height);
                                this.orgX = this.x;
                                this.orgY = this.y;
                                this.state = this.exit;
                                this.colour = "rgb(192,192,255)";
                            }
                            break;
                    }
                }
            }
        },

        onDraw: function(context) {
            context.fillStyle = this.colour;
            context.fillRect(0, 0, this.width + 0, this.height + 0);
        }
    });

    //////////////////////////////////////////////////////////////////////
    // edit cursor

    var Cursor = chs.Class({ inherit$: chs.Drawable,

        $: function(board, palette) {
            chs.Drawable.call(this);
            this.setPosition(cell_width, cell_height);
            this.drawing = false;
            this.board = board;
            this.palette = palette;
            this.cell_x = 0;
            this.cell_y = 0;
            this.currentBlock = 0;
        },

        onDraw: function(context) {
            context.fillStyle = colours[this.palette.currentBlock];
            chs.Util.rect(context, 0, 0, cell_width, cell_height);
            context.fill();
            context.strokeStyle = "rgba(0, 0, 0, 0.5)";
            context.lineWidth = 3;
            context.stroke();
        },

        onUpdate: function(time, deltaTime) {
            var i;
            if(this.drawing) {
                this.board.set(this.cell_x, this.cell_y, this.palette.currentBlock);
            }
            this.setPosition(this.cell_x * cell_width, this.cell_y * cell_height);
        }
    });

    //////////////////////////////////////////////////////////////////////
    // the board

    var Board = chs.Class({ inherit$: chs.Drawable,

        $: function() {
            var i;
            chs.Drawable.call(this);
            this.setPivot(0.5, 0.5);
            this.setPosition(chs.desktop.width / 2, chs.desktop.height / 2);
            this.width = board_width * cell_width;
            this.height = board_height * cell_height;
            this.cells = [];
            this.start = [1, 1];
            this.exit = [2,board_height - 2];
            this.gems = 0;
            this.flip = false;
            this.oldFlip = false;
            this.startRotation = 0;
            this.targetRotation = 0;
            this.rotateStartTime = 0;
            for (i = 0; i < board_size; ++i) {
                this.cells[i] = 0;
            }
            for (i = 0; i < board_width; ++i) {
                this.cells[i] = 1;
                this.cells[i + (board_height - 1) * board_width] = 1;
            }
            for (i = 0; i < board_height; ++i) {
                this.cells[i * board_width] = 1;
                this.cells[board_width - 1 + i * board_width] = 1;
            }
            this.set(this.exit[0], this.exit[1], exit_cell);
            this.set(this.start[0], this.start[1], start_cell);
        },

        check_cell: function(x, y, block) {
            switch(block) {
                case gem_cell:
                    this.gems += 1;
                    break;
                case exit_cell:
                    this.exit = [x, y];
                    break;
                case start_cell:
                    this.start = [x, y];
                    break;
            }
        },

        scan_for_specials: function() {
            var x,
                y;
            this.gems = 0;
            for (y = 1; y < board_height - 1; ++y) {
                for (x = 1; x < board_width - 1; ++x) {
                    this.check_cell(x, y, this.get(x, y));
                }
            }
        },

        get: function(x, y) {
            return this.cells[x + y * board_width];
        },

        set: function(x, y, block) {
            var offset = x + y * board_width;
            if (this.cells[offset] === gem_cell) {
                this.gems -= 1;
            }
            if (block == start_cell) {
                this.cells[this.start[0] + this.start[1] * board_width] = empty_cell;
            }
            this.cells[offset] = block;
            this.check_cell(x, y, block);
        },

        get_cell_from_pixel_position: function(x, y) {
            return this.get((x / cell_width) >>> 0, (y / cell_height) >>> 0);
        },

        set_cell_from_pixel_position: function(x, y, block) {
            return this.set((x / cell_width) >>> 0, (y / cell_height) >>> 0, block);
        },

        copy_to: function(other) {
            var i;
            for (i = 0; i < board_size; ++i) {
                other.cells[i] = this.cells[i];
            }
            other.scan_for_specials();
        },

        copy_from: function(other) {
            var i;
            for (i = 0; i < board_size; ++i) {
                this.cells[i] = other.cells[i];
            }
            this.scan_for_specials();
        },

        set_from_querystring: function() {
            var q = chs.Util.getQuery(),
                nibbles,
                level_len,
                x,
                y,
                i = 0;
            if (q.b !== undefined) {
                nibbles = chs.Util.atob(q.b);
                level_len = ((board_width - 2) * (board_height - 2));
                if (nibbles.length === level_len / 2) {
                    this.gems = 0;
                    for (y = 1; y < board_height - 1; ++y) {
                        for (x = 1; x < board_width - 1; ++x) {
                            this.set(x, y, (nibbles[i >>> 1] >>> ((1 - (i & 1)) * 4)) & 0xf);
                            i += 1;
                        }
                    }
                }
            }
        },

        get_querystring: function() {
            var i,
                x,
                y,
                b;
            b = [];
            i = 0;
            for (y = 1; y < board_height - 1; ++y) {
                for (x = 1; x < board_width - 1; ++x) {
                    b[i >>> 1] |= this.cells[x + y * board_width] << ((1 - (i & 1)) * 4);
                    ++i;
                }
            }
            return encodeURIComponent(chs.Util.btoa(b));
        },

        onUpdate: function(time, deltaTime) {
            var dt,
                x,
                y,
                tmp;
            if (this.flip) {
                if (!this.oldFlip) {
                    this.startRotation = 0;
                    this.targetRotation = Math.PI * -0.5;
                    this.rotateStartTime = time;
                }
                dt = (time - this.rotateStartTime) / lerpTime;
                if (dt < 1) {
                    dt = chs.Util.ease(dt);
                    this.rotation = this.startRotation + (this.targetRotation - this.startRotation) * dt;
                } else {
                    this.rotation = 0;
                    this.flip = false;
                    tmp = [];
                    for (y = 0; y < board_height; ++y) {
                        for (x = 0; x < board_width; ++x) {
                            tmp[(board_width - 1 - y) + x * board_width] = this.cells[x + y * board_width];
                        }
                    }
                    this.cells = tmp;
                    this.dispatchEvent("rotated");
                }
            }
            this.oldFlip = this.flip;
        },

        onDraw: function(context) {
            var x,
                y;
            for (y = 0; y < board_height; ++y) {
                for (x = 0; x < board_width; ++x) {
                    context.fillStyle = colours[this.get(x, y)];
                    context.fillRect(x * cell_width, y * cell_height, cell_width + 0.5, cell_height + 0.5);
                }
            }
        }
    });

    //////////////////////////////////////////////////////////////////////
    // a board which can be edited

    var Editboard = chs.Class({ inherit$: Board,

        $: function(palette) {
            Board.call(this);
            this.cursor = new Cursor(this, palette);
            this.cursor.visible = false;
            this.addChild(this.cursor);
        },

        onMouseMove: function(e) {
            var pos = this.screenToClient(e),
                x = (pos.x / cell_width) >>> 0,
                y = (pos.y / cell_height) >>> 0;
            if (x > 0 && x < board_width - 1 && y > 0 && y < board_height - 1) {
                this.cursor.visible = true;
                this.cursor.cell_x = x;
                this.cursor.cell_y = y;
            } else {
                this.cursor.visible = false;
            }
        },

        onLeftMouseDown: function(e) {
            this.cursor.drawing = this.cursor.visible;
        },

        onLeftMouseUp: function(e) {
            this.cursor.drawing = false;
        }
    });

    //////////////////////////////////////////////////////////////////////
    // instructions

    var Instructions = chs.Class({ inherit$: chs.Label,

        $: function(text, font) {
            chs.Label.call(this, text, font);
            this.age = 0;
        },

        onUpdate: function(time, deltaTime) {
            if (this.visible) {
                this.age += deltaTime;
                if (this.age >= 2000) {
                    this.visible = false;
                } else {
                    this.setScale(1 + this.age / 2000);
                    this.transparency = 255 - (this.age / 2000) * 255;
                }
            }
        }
    });

    //////////////////////////////////////////////////////////////////////
    // a board which can be played

    var Playboard = chs.Class({ inherit$: Board,

        $: function(font) {
            Board.call(this);
            this.player = new Player(this);
            this.instructions = new Instructions("Press space to move & jump", font).setPivot(0.5, 0.5).setPosition(this.width / 2, this.height / 2);
            this.addChild(this.player);
            this.addChild(this.instructions);
            this.addEventHandler("rotated", this.rotated, this);
            this.player.addEventHandler("gameover", this.gameover, this);
            this.gemsRequired = 0;
        },

        rotated: function() {
            var tmp = this.player.x;
            this.player.x = this.width - this.player.y - this.player.width;
            this.player.y = tmp;
        },

        gameover: function() {
            this.instructions.visible = false;
        },

        startPlaying: function() {
            this.gemsRequired = this.gems;
            this.player.reset(this.start[0], this.start[1]);
            this.flip = false;
            this.oldFlip = false;
            this.startRotation = 0;
            this.targetRotation = 0;
            this.rotateStartTime = 0;
            this.instructions.age = 0;
            this.instructions.visible = true;
        },

        onUpdate: function(time, deltaTime) {
            if (this.player.gemsCollected === this.gemsRequired && this.player.alive) {
                colours[exit_cell] = "rgb(255, 192, " + ((Math.sin(time / 50) * 64 + 191) >>> 0).toString() + ")";
            }
            Board.prototype.onUpdate.call(this, time, deltaTime);
        }
    });

    //////////////////////////////////////////////////////////////////////
    // palette of blocks for editor

    var Palette = chs.Class({inherit$: chs.Drawable,

        $: function() {
            chs.Drawable.call(this);
            this.setPosition(60, 50);
            this.width = cell_width;
            this.height = cell_height * colours.length;
            this.currentBlock = 0;
        },

        onDraw: function(context) {
            var i;
            for (i = 0; i < colours.length; ++i) {
                context.fillStyle = colours[i];
                chs.Util.rect(context, 0, i * cell_height, cell_width, cell_width);
                context.fill();
                chs.Debug.text(60 + cell_width + 8, 50 + i * cell_height + 8, descriptions[i]);
            }
            chs.Util.rect(context, 0, this.currentBlock * cell_height, cell_width, cell_width);
            context.strokeStyle = "black";
            context.lineWidth = 5;
            context.stroke();
        },

        onLeftMouseDown: function (e) {
            this.currentBlock = (this.screenToClient(e).y / cell_height) >>> 0;
        }
    });

    //////////////////////////////////////////////////////////////////////
    // the editor bits

    var Editor = chs.Class({ inherit$: chs.Drawable,

        $: function(font) {
            chs.Drawable.call(this);
            var fh = font.height;
            this.rotateButton = new chs.TextButton("Rotate", font, 700, 10 + fh * 5, 120, fh * 2, this.rotate, this);
            this.saveButton = new chs.TextButton("Save", font, 700, 10 + fh * 8, 120, fh * 2, this.save, this);
            this.palette = new Palette();
            this.editBoard = new Editboard(this.palette);
            this.addChild(this.palette);
            this.addChild(this.rotateButton);
            this.addChild(this.saveButton);
            this.addChild(this.editBoard);
            this.editBoard.set_from_querystring();
        },

        rotate: function() {
            this.editBoard.cursor.visible = false;
            this.editBoard.flip = true;
        },

        save: function () {
            window.prompt("Here's the link\nPress ctrl-c to copy it\nThen post it in /r/Tripple",
                "http://skilbeck.com/tripple?b=" + this.editBoard.get_querystring());
        }
    });

    //////////////////////////////////////////////////////////////////////
    // the game controller - can be in editing or playing mode...

    var Game = chs.Class({ inherit$: chs.Drawable,

        $: function() {
            chs.Drawable.call(this);
            this.width = chs.desktop.width;
            this.height = chs.desktop.height;
            this.loader = new chs.Loader('img/');
            this.font = chs.Font.load('Consolas', this.loader);
            this.loader.addEventHandler("complete", this.init, this);
            this.enabled = false;
            this.loader.start();
        },

        init: function() {
            var fh = this.font.height;
            this.mode = 'play';
            this.playButton = new chs.TextButton("Edit", this.font, 700, 10, 120, fh * 2, this.toggleEditing, this);
            this.playBoard = new Playboard(this.font);
            this.editor = new Editor(this.font);
            this.scoreLabel = new chs.Label("Gems: 0", this.font).setPosition(20, 20);
            this.addChild(this.playBoard);
            this.addChild(this.scoreLabel);
            this.addChild(this.playButton);
            this.playBoard.player.addEventHandler("gameover", this.startEditing, this);
            this.enabled = true;
            this.playBoard.set_from_querystring();
            this.playBoard.startPlaying();
        },

        toggleEditing: function() {
            switch(this.mode) {
                case 'play':
                    this.startEditing();
                    break;
                case 'edit':
                    this.startPlaying();
                    break;
            }
        },

        startPlaying: function() {
            this.mode = 'play';
            this.playButton.text = "Edit";
            this.playBoard.copy_from(this.editor.editBoard);
            this.addChild(this.playBoard);
            this.removeChild(this.editor);
            this.playBoard.startPlaying();
        },

        startEditing: function() {
            this.mode = 'edit';
            this.playButton.text = "Play";
            this.addChild(this.editor);
            this.removeChild(this.playBoard);
            reset_colours();
        },

        onUpdate: function(time, deltaTime) {
            var s = "Gems: ";
            if (this.mode === 'play') {
                s += this.playBoard.player.gemsCollected.toString() + " of " + this.playBoard.gemsRequired.toString();
            } else if (this.mode === 'edit') {
                s += this.editor.editBoard.gems.toString();
            }
            this.scoreLabel.text = s;
        }
    });

    desktop.addChild(new Game());
}
