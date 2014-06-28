//////////////////////////////////////////////////////////////////////
// different sized boards
// zoom in / out
// scrolling / pivot point on the player?

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var board_width = 14,
        board_height = 14,
        cell_width = 32,
        cell_height = 32,
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
            "rgb(0,0,0)"        // 5: start position
        ],
        descriptions = [
            "space",
            "platform",
            "poison",
            "gem",
            "exit",
            "player"
        ],
        offsets = [
            [0, 0],
            [cell_width - 1, 0],
            [0, cell_height - 1],
            [cell_width - 1, cell_height - 1]
        ],

        level_len = ((board_width - 2) * (board_height - 2)),

        empty_cell = 0,
        platform_cell = 1,
        poison_cell = 2,
        gem_cell = 3,
        exit_cell = 4,
        start_cell = 5,

        score = 0,
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
    // the player

    mtw.Player = chs.Class({ inherit$: chs.Drawable,

        $: function(board) {
            chs.Drawable.call(this);
            this.width = cell_width;
            this.height = cell_height;
            this.setPosition(cell_width * 3, cell_height * 2);
            this.board = board;
            this.reset();
        },

        reset: function(x, y) {
            this.standing = false;
            this.flying = false;
            this.jump = false;
            this.xvel = 0;
            this.yvel = 0;
            this.colour = "black";
            this.visible = true;
            this.setPosition(x * cell_width, y * cell_height);
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
                wasFlying = flying,
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
                        jump = false;
                        space = false;
                        flip = true;
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
                        flying = false;
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
                        jump = false;
                        space = false;
                        flip = true;
                    } else {
                        ny = round_down(ny, cell_height);
                        this.yvel = 0;
                        flying = false;
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
                    jump = false;
                    space = false;
                    flip = true;
                    break;
                case 11:
                    nx = round_down(nx, cell_width);    // !!!
                    ny = round_up(ny, cell_height);
                    this.xvel = 0;
                    this.yvel = 0;
                    flip = true;
                    break;
                case 12:
                    ny = round_down(ny, cell_height);
                    this.yvel = 0;
                    flying = false;
                    break;
                case 13:
                    nx = round_up(nx, cell_width);
                    ny = round_down(ny, cell_height);
                    this.xvel = 0;
                    this.yvel = 0;
                    flying = false;
                    break;
                case 14:
                    nx = round_down(nx, cell_width);    // !!!
                    ny = round_down(ny, cell_height);
                    this.xvel = 0;
                    this.yvel = 0;
                    flip = true;
                    flying = false;
                    break;
                case 15:
                    nx = this.x;
                    ny = this.y;
                    this.xvel = 0;
                    this.yvel = 0;
                    flying = false;
                    break;
            }
            this.x = nx;
            this.y = ny;
            if (flying) {
                space = false;
            } else if (wasFlying) {
                this.xvel = 0;
                jump = false;
                space = false;
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

        die: function(time, deltaTime) {
            if (this.stateTime > 1000) {
                game.reset();
            } else {
                this.visible = !this.visible;
            }
        },

        exit: function(time, deltaTime) {
            var t;
            if (this.stateTime > 500) {
                game.reset();
            } else {
                t = chs.Util.ease2(Math.min(1, this.stateTime / 250), 6);
                this.x = this.orgX + (this.targetX - this.orgX) * t;
                this.y = this.orgY + (this.targetY - this.orgY) * t;
            }
        },

        play: function(time, deltaTime) {
            var dt = Math.min(1000/10, deltaTime),
                of = flip,
                mask,
                i,
                u,
                v,
                firstMask;
            if (flip && !of) {
                jump = false;
                space = false;
                flying = false;
                this.xvel = 0;
                this.yvel = 0;
            }
            else if (!flip) {
                if (space) {
                    this.xvel = run_speed;
                } else if (jump) {
                    this.xvel = run_speed;
                    this.yvel = -jump_impulse;
                    jump = false;
                    flying = true;
                }
                this.yvel += gravity * dt;
                mask = 0;
                while (dt > 0) {
                    mask |= this.move(Math.min(dt, 1));
                    dt -= 1;
                }
                if (mask === 0) {
                    flying = true;
                }

                for(i = 0; i < 4; i += 1) {
                    u = this.x + offsets[i][0];
                    v = this.y + offsets[i][1];
                    switch(get_cell(u, v)) {
                        case gem_cell:
                            set_cell(u, v, 0);
                            score += 1;
                            break;
                        case poison_cell:
                            this.state = this.die;
                            this.colour = "rgb(128,128,128)";
                            break;
                        case exit_cell:
                            if (score >= gems_needed) {
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
            context.fillRect(0.5, 0.5, this.width + 0.5, this.height + 0.5);
        }
    });

    //////////////////////////////////////////////////////////////////////
    // edit cursor

    mtw.Cursor = chs.Class({inherit$: chs.Drawable,

        $: function(board, palette) {
            chs.Drawable.call(this);
            this.setPosition(cell_width, cell_height);
            this.drawing = false;
            this.offset = 0;
            this.startOffset = 0;
            this.board = board;
            this.palette = palette;
            this.cell_x = 0;
            this.cell_y = 0;
        },

        onDraw: function(context) {
            context.fillStyle = colours[this.palette.currentBlock];
            chs.Util.rect(context, 0.5, 0.5, cell_width, cell_height);
            context.fill();
            context.strokeStyle = "rgba(0, 0, 0, 0.5)";
            context.lineWidth = 3;
            context.stroke();
        },

        onUpdate: function(time, deltaTime) {
            var i;
            chs.Debug.text(20, 300, "Start: " + startX.toString() + "," + startY.toString());
            if(this.drawing) {
                this.board.set(this.cell_x, this.cell_y, this.currentBlock);
            }
        }
    });

    //////////////////////////////////////////////////////////////////////
    // the board

    mtw.Board = chs.Class({ inherit$: chs.Drawable,

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
            if (this.cells[offset] === gem) {
                this.gems -= 1;
            }
            this.cells[offset] = block;
            this.check_cell(x, y, block);
        },

        copy_to: function(other) {
            var i;
            for (i = 0; i < level_len; ++i) {
                other.cells[i] = this.cells[i];
            }
            other.scan_for_specials();
        },

        copy_from: function(other) {
            var i;
            for (i = 0; i < level_len; ++i) {
                this.cells[i] = other.cells[i];
            }
            this.scan_for_specials();
        },

        set_from_querystring: function() {
            var q = chs.Util.getQuery(),
                nibbles,
                i;
            if (q.b !== undefined) {
                nibbles = chs.Util.atob(q.b);
                if (nibbles.length === level_len / 2) {
                    for (i = 0; i < level_len; ++i) {
                        this.cells[i] = (nibbles[i >>> 1] >>> ((1 - (i & 1)) * 4)) & 0xf;
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
                dt = (time - rotateStartTime) / lerpTime;
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
                    tmp = player.x;
                    player.x = this.width - player.y - player.width;
                    player.y = tmp;
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
                    context.fillRect(0.5 + x * cell_width, 0.5 + y * cell_height, cell_width + 0.5, cell_height + 0.5);
                }
            }
        }
    });

    //////////////////////////////////////////////////////////////////////
    // a board which can be edited

    mtw.EditBoard = chs.Class({ inherit$: mtw.Board,

        $: function(palette) {
            mtw.Board.call(this);
            this.cursor = new mtw.Cursor(this, palette);
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
                this.cursor.setPosition(x * cell_width, y * cell_height);
            } else {
                this.cursor.visible = false;
            }
        },

        onLeftMouseDown: function(e) {
            this.cursor.drawing = cursor.visible;
        },

        onLeftMouseUp: function(e) {
            this.cursor.drawing = false;
        }
    });

    //////////////////////////////////////////////////////////////////////
    // a board which can be played

    mtw.PlayBoard = chs.Class({ inherit$: mtw.Board,

        $: function() {
            mtw.Board.call(this);
            this.player = new mtw.Player(this);
            this.addChild(this.player);
            this.gemsCollected = 0;
        },

        startPlaying: function() {
            this.player.reset(this.start[0], this.start[1]);
            this.gemsCollected = 0;
            this.flip = false;
            this.oldFlip = false;
            this.startRotation = 0;
            this.targetRotation = 0;
            this.rotateStartTime = 0;
            this.gemsCollected = 0;
        }
    });

    //////////////////////////////////////////////////////////////////////
    // palette of blocks for editor

    mtw.Palette = chs.Class({inherit$: chs.Drawable,

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
            context.strokeStyle = "white";
            context.lineWidth = 2;
            context.stroke();
        },

        onLeftMouseDown: function (e) {
            this.currentBlock = (this.screenToClient(e).y / cell_height) >>> 0;
        }
    });

    //////////////////////////////////////////////////////////////////////
    // the editor bits

    mtw.Editor = chs.Class({ inherit$: chs.Drawable,

        $: function(font) {
            var fh = font.height;
            this.rotateButton = new chs.TextButton("Rotate", font, 700, fh * 3, 120, fh * 1.5, this.rotate, this);
            this.saveButton = new chs.TextButton("Save", font, 700, fh * 4.5, 120, fh * 1.5, this.save, this);
            this.palette = new mtw.Palette();
            this.editBoard = new mtw.EditBoard(this.palette);
            this.addChild(this.palette);
            this.addChild(this.rotateButton);
            this.addChild(this.saveButton);
            this.addChild(this.editBoard);
            this.editBoard.set_from_querystring();
        },

        rotate: function() {
            this.editBoard.flip = true;
        },

        save: function () {
            window.prompt("Here's the link\nPress ctrl-c to copy it\nThen post it in /r/Tripple",
                "http://skilbeck.com/tripple?b=" + this.editBoard.get_querystring());
        }
    });


    //////////////////////////////////////////////////////////////////////
    // the game controller - can be in editing or playing mode...

    mtw.Game = chs.Class({ inherit$: chs.Drawable,

        $: function() {
            chs.Drawable.call(this);
            this.width = chs.desktop.width;
            this.height = chs.desktop.height;
            this.loader = new chs.Loader('img/');
            this.font = chs.Font.load('Calibri', this.loader);
            this.loader.addEventHandler("complete", this.init, this);
            this.loader.start();
        },

        init: function() {
            this.mode = 'play';
            this.playButton = new chs.TextButton("Edit", this.font, 700, 0, 120, fh * 1.5, this.toggleEditing, this);
            this.playBoard = new mtw.PlayBoard();
            this.editor = new mtw.Editor(this.font);
            this.scoreLabel = new chs.Label("Gems: 0", this.font);
            this.startPlaying();
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
            this.playBoard.copy_from(this.editBoard);
            this.editor.visible = false;
            this.editor.enabled = false;
            this.playBoard.visible = true;
            this.playBoard.enabled = true;
            this.playBoard.startPlaying();
        },

        startEditing: function() {
            this.mode = 'edit';
            this.playButton.text = "Play";
            this.editor.visible = true;
            this.editor.enabled = true;
            this.playBoard.visible = false;
            this.playBoard.enabled = false;
        }
    });

}());