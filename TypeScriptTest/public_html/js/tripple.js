//////////////////////////////////////////////////////////////////////
// make a blank level
// maybe override it from the query string
// that's your edit_level
// edit: edit_level
// play: copy edit_level to board

// level editor
// restart button
// space,jump in 1 frame

// game states:
//  main menu
//  playing
//  level editor

// player states:
//  playing
//  dying - flash for a bit, then reset to current level
//  winning - lerp to the position of the exit square, then reset to next level

// Level:
// Width, Height
// Board

//////////////////////////////////////////////////////////////////////

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
        loader,
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

        mode = 'play',
        game = null,
        mainmenu = null,
        level_len = ((board_width - 2) * (board_height - 2)),
        savedLevelString = "54" + chs.Util.str_rep(" ", level_len - 2), // override this from the query string
        empty = 0,
        platform = 1,
        poison = 2,
        gem = 3,
        exit = 4,
        start_cell = 5,
        score = 0,
        gems_needed = 0,
        playfield = null,
        player = null,
        editBoard = [],
        board = [],
        startRotation,
        targetRotation,
        rotateStartTime,
        lerpTime = 400,
        flip = false,
        oldFlip = false,
        space = false,
        standing = false,
        flying = false,
        sq22 = Math.sqrt(2) / 2,
        currentBlock = 2,
        cursor = null,
        startX = 1,
        startY = 1,
        palette = null,
        jump = false;

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

    function get_cell(x, y) {
        return board[((x / cell_width) >>> 0) + ((y / cell_height) >>> 0) * board_width];
    }

    //////////////////////////////////////////////////////////////////////

    function set_cell(x, y, value) {
        board[((x / cell_width) >>> 0) + ((y / cell_height) >>> 0) * board_width] = value;
    }

    //////////////////////////////////////////////////////////////////////

    function copy_from_edit_board() {
        var i;
        board = [];
        for (i = 0; i < board.length; ++i) {
            board[i] = editBoard[i];
        }
    }

    //////////////////////////////////////////////////////////////////////

    function copy_to_edit_board() {
        var i;
        editBoard = [];
        for (i = 0; i < board.length; ++i) {
            editBoard[i] = board[i];
        }
    }

    //////////////////////////////////////////////////////////////////////
    // hmmm: find the start square (5)

    function init_board(input_board) {
        var x,
            y,
            i,
            l,
            c,
            startPos = { x: cell_width, y : cell_height, gems: 0 };

        if (input_board.length !== level_len) {
            return;
        }
        x = 0;
        y = 0;
        for (i = 0, l = input_board.length; i < l; ++i) {
            c = input_board[l];
            switch (c) {
                case start_cell:
                    startPos.x = (x + 1) * cell_width;
                    startPos.y = (y + 1) * cell_height;
                    break;
                case gem:
                    startPos.gems += 1;
                    break;
                default:
                    c = Math.min(c, colours.length - 1);
                    break;
            }
            board[x + 1 + (y + 1) * board_width] = c;
            x += 1;
            if (x > 11) {
                x = 0;
                y += 1;
            }
        }
        // add top, bottom
        for (i = 0; i < board_width; ++i) {
            board[i] = 1;
            board[i + (board_height - 1) * board_width] = 1;
        }

        // add left, right
        for (i = 0; i < board_height; ++i) {
            board[i * board_width] = 1;
            board[board_width - 1 + i * board_width] = 1;
        }
        return startPos;
    }

    //////////////////////////////////////////////////////////////////////
    // a crappy button

    mtw.Button = chs.Class({inherit$: [chs.Button, chs.Drawable],

        $: function(x, y, width, height, text, callback, context) {
            chs.Button.call(this, callback, context);
            chs.Drawable.call(this);
            this.text = text;
            this.setPosition(x, y);
            this.width = width;
            this.height = height;
            this.colour = "rgb(192, 192, 192)";
        },

        onIdle: function() { this.colour = "rgb(192, 192, 192)"; },
        onPressed: function() { this.colour = "rgb(192, 32, 16)"; },
        onHover: function() { this.colour = "rgb(128, 128, 128)"; },

        onDraw: function(context) {
            context.fillStyle = this.colour;
            chs.Util.rect(context, 0, 0, this.width, this.height);
            context.fill();
            chs.Debug.text(this.x + 8, this.y + 4, this.text);
        }
    });

    //////////////////////////////////////////////////////////////////////
    // the player

    mtw.Player = chs.Class({inherit$: chs.Drawable,

        $: function() {
            chs.Drawable.call(this);
            this.width = cell_width;
            this.height = cell_height;
            this.setPosition(cell_width * 3, cell_height * 2);
            this.xvel = 0;
            this.yvel = 0;
            this.colour = "black";
        },

        onKeyDown: function(e) {
            if (!flip) {
                space = e.name === 'space';
                jump = false;
            }
        },

        onKeyUp: function(e) {
            if (e.name === 'space') {
                jump = space;
                space = false;
            }
        },

        check: function(xpos, ypos, value) {
            var mask = 0,
                i,
                bit;
            for (i = 0; i < 4; ++i) {
                bit = 1 << i;
                if (get_cell(xpos + offsets[i][0], ypos + offsets[i][1]) === value) {
                    mask += bit;
                }
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
                mask = this.check(nx, ny, platform);
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
                        case gem:
                            set_cell(u, v, 0);
                            score += 1;
                            break;
                        case poison:
                            this.state = this.die;
                            this.colour = "rgb(128,128,128)";
                            break;
                        case exit:
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

        $: function() {
            chs.Drawable.call(this);
            this.setPosition(cell_width, cell_height);
            this.drawing = false;
            this.offset = 0;
            this.startOffset = 0;
        },

        onDraw: function(context) {
            context.fillStyle = colours[currentBlock];
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
                if (currentBlock === start_cell) {
                    if (this.startOffset !== 0) {
                        board[this.startOffset] = 0;
                    }
                    startX = this.offset % board_width;
                    startY = (this.offset / board_width) >>> 0;
                    this.startOffset = this.offset;
                    board[this.offset] = currentBlock;
                } else {
                    board[this.offset] = currentBlock;
                    gems_needed = 0;
                    for (i = 0; i < board_size; ++i) {
                        if (board[i] === gem) {
                            gems_needed += 1;
                        }
                    }
                }
            }
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
        },

        onDraw: function(context) {
            var i;
            for (i = 0; i < colours.length; ++i) {
                context.fillStyle = colours[i];
                chs.Util.rect(context, 0, i * cell_height, cell_width, cell_width);
                context.fill();
                chs.Debug.text(60 + cell_width + 8, 50 + i * cell_height + 8, descriptions[i]);
            }
            chs.Util.rect(context, 0, currentBlock * cell_height, cell_width, cell_width);
            context.strokeStyle = "white";
            context.lineWidth = 2;
            context.stroke();
        },

        onLeftMouseDown: function (e) {
            currentBlock = (this.screenToClient(e).y / cell_height) >>> 0;
        }

    });

    //////////////////////////////////////////////////////////////////////
    // the playfield

    mtw.TripplePlayfield = chs.Class({inherit$: chs.Drawable,

        $: function() {
            var i;
            chs.Drawable.call(this);
            playfield = this;
            this.width = board_width * cell_width;
            this.height = board_height * cell_height;
            this.setPivot(0.5, 0.5);
            this.setPosition(chs.desktop.width / 2, chs.desktop.height / 2);
            player = new mtw.Player();
            cursor = new mtw.Cursor();
        },

        startPlaying: function () {
            // save the board, restore it when they go back to editing
            this.stopEditing();
            player.setPosition(startX * cell_width, startY * cell_height);
            player.xvel = 0;
            player.yvel = 0;
            this.addChild(player);
            colours[start_cell] = "rgb(192,192,192)";
        },

        stopPlaying: function () {
            this.removeChild(player);
        },

        startEditing: function() {
            this.stopPlaying();
            this.addChild(cursor);
            palette.visible = true;
            palette.enabled = true;
            colours[start_cell] = "black";
        },

        stopEditing: function () {
            this.removeChild(cursor);
            palette.visible = false;
            palette.enabled = false;
        },

        onMouseMove: function(e) {
            var pos = this.screenToClient(e),
                x = (pos.x / cell_width) >>> 0,
                y = (pos.y / cell_height) >>> 0;
            if (x > 0 && x < board_width - 1 && y > 0 && y < board_height - 1) {
                cursor.visible = true;
                cursor.offset = x + y * board_width;
                cursor.setPosition(x * cell_width, y * cell_height);
            } else {
                cursor.visible = false;
            }
        },

        onLeftMouseDown: function(e) {
            cursor.drawing = cursor.visible;
        },

        onLeftMouseUp: function(e) {
            cursor.drawing = false;
        },

        save: function() {
            var i,
                x,
                y,
                b;
            b = [];
            i = 0;
            board[startX + startY * board_width] = start_cell;
            for (y = 1; y < board_height - 1; ++y) {
                for (x = 1; x < board_width - 1; ++x) {
                    b[i >>> 1] |= board[x + y * board_width] << ((1 - (i & 1)) * 4);
                    ++i;
                }
            }
            board[startX + startY * board_width] = 0;
            window.prompt("Here's the link, press ctrl-c to copy it,\nthen post it in /r/Tripple - Good Luck!",
                            "http://skilbeck.com/tripple" +
                            "?b=" + encodeURIComponent(chs.Util.btoa(b)));
        },

        onUpdate: function(time, deltaTime) {
            var dt,
                x,
                y,
                tmp;
            if (flip) {
                if (!oldFlip) {
                    startRotation = 0;
                    targetRotation = Math.PI * -0.5;
                    rotateStartTime = time;
                }
                dt = (time - rotateStartTime) / lerpTime;
                if (dt < 1) {
                    dt = chs.Util.ease(dt);
                    this.rotation = startRotation + (targetRotation - startRotation) * dt;
                } else {
                    this.rotation = 0;
                    flip = false;
                    tmp = [];
                    for (y = 0; y < board_height; ++y) {
                        for (x = 0; x < board_width; ++x) {
                            tmp[(board_width - 1 - y) + x * board_width] = board[x + y * board_width];
                        }
                    }
                    board = tmp;
                    tmp = player.x;
                    player.x = this.width - player.y - player.width;
                    player.y = tmp;
                }
            }
            oldFlip = flip;
            chs.Debug.print("Level: " + (level + 1).toString());
            chs.Debug.print("Gems: " + score.toString() + " of " + gems_needed.toString());
            if (score >= gems_needed && mode == 'play') {
                colours[exit] = "rgb(255,255," + ((Math.sin(chs.Timer.time / 33) * 127 + 128) >>> 0).toString() + ")";
            } else {
                colours[exit] = "rgb(255,192,0)";
            }
        },

        onDraw: function(context) {
            var x,
                y,
                cell;
            for (y = 0; y < board_height; ++y) {
                for (x = 0; x < board_width; ++x) {
                    cell = board[x + y * board_width];
                    context.fillStyle = colours[cell];
                    context.fillRect(0.5 + x * cell_width, 0.5 + y * cell_height, cell_width + 0.5, cell_height + 0.5);
                }
            }
        }
    });

    //////////////////////////////////////////////////////////////////////

    mtw.Game = chs.Class({inherit$: chs.Drawable,

        $: function() {
            var pf,
                bs,
                q;
            chs.Drawable.call(this);
            this.width = chs.desktop.width;
            this.height = chs.desktop.height;
            pf = new mtw.TripplePlayfield();
            this.addChild(playfield);
            palette = new mtw.Palette();
            this.addChild(palette);
            mode = "play";
            game = this;

            this.addChild(new mtw.Button(700, 10, 120, 20, "Edit", function() {
                switch(mode) {
                    case 'play':
                        mode = 'edit';
                        this.text = 'Play';
                        playfield.startEditing();
                        break;
                    case 'edit':
                        mode = 'play';
                        this.text = 'Edit';
                        playfield.startPlaying();
                        break;
                }
            }));

            this.rotateButton = new mtw.Button(700, 40, 120, 20, "Rotate", function() { flip = true; });
            this.saveButton = new mtw.Button(700, 70, 120, 20, "Save", playfield.save, playfield);
            this.addChild(this.rotateButton);
            this.addChild(this.saveButton);

            bs = ((board_width - 2) * (board_height - 2) / 2);
            q = chs.Util.getQuery();
            if (q.b !== undefined) {
                board_array = [];
                board_nibbles = chs.Util.atob(q.b);
                if (board_nibbles.length === bs) {
                    for (i = 0; i < bs * 2; ++i) {
                        board_array.push(((board_nibbles[i >>> 1] >>> ((1 - (i & 1)) * 4)) & 0xf).toString());
                    }
                }
                savedLevelString = board_array.join('');
            }
            this.reset();
            playfield.startPlaying();
        },

        reset: function() {
            var i,
                startPos,
                got_board = false,
                board_nibbles,
                board_array,
                bs,
                q;

            playfield.rotation = 0;
            playfield.width = board_width * cell_width;
            playfield.height = board_height * cell_height;
            flip = false;
            oldFlip = false;
            space = false;
            standing = false;
            flying = false;
            jump = false;
            player.xvel = 0;
            player.yvel = 0;
            player.state = player.play;
            player.colour = "black";
            player.visible = true;
            score = 0;
            colours[exit] = "rgb(255,192,0)";
            startPos = init_board(savedLevelString);
            player.setPosition(startPos.x, startPos.y);
            gems_needed = startPos.gems;
        }
    });


}());