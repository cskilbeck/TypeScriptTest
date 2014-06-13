// how many gems you have to collect before the exit appears
// timer (running out?)
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

(function () {
    "use strict";

    var board_width = 14,
        board_height = 14,
        cell_width = 32,
        cell_height = 32,
        gravity = 0.005,
        run_speed = 0.5,
        jump_impulse = 0.85,
        board_size = board_width * board_height,
        colours = [
            "white",
            "rgb(0,112,0)",  // 1: green: platform
            "rgb(255,0,0)",  // 2: red: poison
            "rgb(0,0,255)",  // 3: blue: gem
            "rgb(255,192,0)" // 4: yellow: exit
        ],
        offsets = [
            [0, 0],
            [cell_width - 1, 0],
            [0, cell_height - 1],
            [cell_width - 1, cell_height - 1]
        ],

        empty = 0,
        platform = 1,
        poison = 2,
        gem = 3,
        exit = 4,
        score = 0,
        playfield = null,
        player = null,
        board = [],
        startRotation,
        targetRotation,
        rotateStartTime,
        lerpTime = 750,
        flip = false,
        oldFlip = false,
        space = false,
        standing = false,
        flying = false,
        sq22 = Math.sqrt(2) / 2,
        jump = false;

    function fmod(x, y) {
        return x - ((x / y) >>> 0) * y;
    }

    function round_up(x, y) {
        return (((x + y - 1) / y) >>> 0) * y;
    }

    function round_down(x, y) {
        return ((x / y) >>> 0) * y;
    }

    function reset() {
        var i;

        playfield.rotation = 0;
        playfield.width = board_width * cell_width;
        playfield.height = board_height * cell_height;

        flip = false;
        oldFlip = false;
        space = false;
        standing = false;
        flying = false;
        jump = false;
        player.setPosition(cell_width * 3, cell_height * 2);
        player.xvel = 0;
        player.yvel = 0;
        player.state = player.play;
        player.colour = "black";
        score = 0;

        // clear the board to white
        for (i = 0; i < board_size; ++i) {
            board[i] = 0;
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

        // now add the rest
        board[3 + 5 * board_width] = 1;
        board[3 + 6 * board_width] = 1;
        board[4 + 5 * board_width] = 1;
        board[4 + 6 * board_width] = 1;
        board[6 + 4 * board_width] = 1;

        board[3 + 11 * board_width] = 2;
        board[12 + 6 * board_width] = 2;

        board[4 + 4 * board_width] = 3;
        board[11 + 8 * board_width] = 3;
        board[9 + 6 * board_width] = 3;
        board[11 + 11 * board_width] = 3;

        board[11 + 4 * board_width] = 4;
    }

    function get_cell(x, y) {
        return board[((x / cell_width) >>> 0) + ((y / cell_height) >>> 0) * board_width];
    }

    function set_cell(x, y, value) {
        board[((x / cell_width) >>> 0) + ((y / cell_height) >>> 0) * board_width] = value;
    }

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
                reset();
            }
        },

        exit: function(time, deltaTime) {
            if (this.stateTime > 1000) {
                reset();
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
                            this.state = this.exit;
                            this.colour = "rgb(192,192,255)";
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

    mtw.Tripple = chs.Class({inherit$: chs.Drawable,

        $: function() {
            var i;
            chs.Drawable.call(this);
            playfield = this;

            this.width = board_width * cell_width;
            this.height = board_height * cell_height;
            this.setPivot(0.5, 0.5);
            this.setPosition(chs.desktop.width / 2, chs.desktop.height / 2);
            player = new mtw.Player();
            this.addChild(player);

            reset();
        },

        onUpdate: function(time, deltaTime) {
            var dt,
                x,
                y,
                tmp;
            if (flip) {
                if (!oldFlip) {
                    oldFlip = true;
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
            chs.Debug.print("Score: " + score.toString());
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

}());