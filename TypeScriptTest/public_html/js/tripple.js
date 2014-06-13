(function (){
    "use strict";

    var board_width = 14,
        board_height = 14,
        board_size = board_width * board_height,
        cell_width = 32,
        cell_height = 32,
        board_width_in_pixels = board_width * cell_width,
        board_height_in_pixels = board_height * cell_height,
        gravity = 0.005,
        colours = [
            "white",
            "rgb(0,112,0)",  // 1: green: platform
            "rgb(255,0,0)",  // 2: red: deadly
            "rgb(0,0,255)"   // 3: blue: collectible    // (and 4: start position)
        ],
        board = [],
        // player
        player = null,
        startRotation,
        targetRotation,
        rotateStartTime,
        lerpTime = 1000,
        flip = false,
        oldFlip = false,
        space = false,
        standing = false,
        flying = false,
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

    mtw.Player = chs.Class({inherit$: chs.Drawable,

        $: function() {
            chs.Drawable.call(this);
            this.width = cell_width;
            this.height = cell_height;
            this.setPosition(cell_width * 3, cell_height * 2);
            this.xvel = 0;
            this.yvel = 0;
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

        check: function(xpos, ypos) {
            var x,
                y,
                u,
                v,
                cell,
                mask = 0,
                bit = 1;
            for (y = 0; y < 2; ++y) {
                for (x = 0; x < 2; ++x) {
                    u = ((xpos + x * (cell_width - 1)) / cell_width) >>> 0;
                    v = ((ypos + y * (cell_height - 1)) / cell_height) >>> 0;
                    cell = board[u + v * board_width];
                    if (cell === 1) {
                        mask += bit;
                    }
                    bit <<= 1;
                }
            }
            return mask;
        },

        move: function(deltaTime) {
            var nx = this.x + this.xvel * deltaTime,
                ny = this.y + this.yvel * deltaTime,
                ox,
                oy,
                wasFlying = flying,
                mask = this.check(nx, ny);
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
                    if (Math.atan2(this.xvel, this.yvel) > 0) {
                        nx = round_up(nx, cell_width);
                        ny = round_up(ny, cell_height);
                    } else {
                        nx = round_down(nx, cell_width);
                        ny = round_down(ny, cell_height);
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
        },

        onUpdate: function(time, deltaTime) {
            var dt = deltaTime,
                of = flip;
            chs.Debug.print(Math.atan2(this.xvel, this.yvel));
            if (flip && !of) {
                jump = false;
                space = false;
                flying = false;
                this.xvel = 0;
                this.yvel = 0;
            }
            else if (!flip) {
                if (space) {
                    this.xvel = 0.5;
                } else if (jump) {
                    this.yvel = -0.75;
                    console.log("JUMP!!!!!!!!!!!");
                    jump = false;
                    flying = true;
                }
                this.yvel += gravity * deltaTime;
                chs.Debug.print(this.xvel.toFixed(2), this.yvel.toFixed(2));
                while (dt > 0) {
                    this.move(Math.min(dt, 1));
                    dt -= 1;
                }
            }
        },

        onDraw: function(context) {
            context.fillStyle = 'black';
            context.fillRect(0.5, 0.5, this.width, this.height);
        }
    });

    mtw.Tripple = chs.Class({inherit$: chs.Drawable,

        $: function() {
            var i;
            chs.Drawable.call(this);
            this.width = board_width * cell_width;
            this.height = board_height * cell_height;
            this.setPivot(0.5, 0.5);
            this.setPosition(chs.desktop.width / 2, chs.desktop.height / 2);

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

            player = new mtw.Player();
            this.addChild(player);
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
                    // actually flip everything
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