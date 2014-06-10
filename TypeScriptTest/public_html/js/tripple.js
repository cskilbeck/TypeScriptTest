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
        board,
        // player
        score = 0,
        dead = false,
        rotate,
        angle = 0,
        rotateTime,
        currentRotation,
        targetRotation,
        standing = false,
        space,
        jump,
        jumping,
        lerpTime = 500,
        trans = [
            { x: "x", y: "y", xm: 1, ym: 1},        // 0
            { x: "y", y: "x", xm: 1, ym: -1},       // 90
            { x: "x", y: "y", xm: -1, ym: -1},      // 180
            { x: "y", y: "x", xm: -1, ym: 1},       // 270
        ];

    mtw.Player = chs.Class({inherit$: chs.Drawable,

        $: function() {
            chs.Drawable.call(this);
            this.width = cell_width;
            this.height = cell_height;
            this.setPosition(cell_width * 2 + 1, cell_height * 2);
            this.xvel = 0;
            this.yvel = 0;
        },

        onKeyDown: function(e) {
            space = e.name === 'space';
            jump = false;
        },

        onKeyUp: function(e) {
            if (e.name === 'space') {
                jump = space;
                space = false;
            }
        },

        check: function(x, y, contacts) {
            var p,
                q,
                u,
                v,
                cell,
                blocking = false;
            for (q = 0; q < 2; ++q) {
                for (p = 0; p < 2; ++p) {
                    u = ((x + p * this.width) / cell_width) >>> 0;
                    v = ((y + q * this.height) / cell_height) >>> 0;
                    cell = board[u + v * board_width];
                    if (cell === 1) {
                        blocking = true;
                    }
                    contacts.push({ x: u, y: v, cell: cell });
                }
            }
            return blocking;
        },

        move: function(deltaTime) {
            var x,
                y,
                u,
                v,
                cell,
                mask = 0,
                add = 1,
                xvel,
                yvel,
                ho,
                ve,
                bo,
                horiz = [],
                vert = [],
                both = [];

            xvel = this.xvel;
            yvel = this.yvel;

            ho = this.check(this.x + xvel, this.y, horiz);
            ve = this.check(this.x, this.y + yvel, vert);
            bo = this.check(this.x + xvel, this.y + yvel, both);

            if (ho && !ve) {
                xvel = 0;
                yvel = 0;
                currentRotation = -angle / 2 * Math.PI;
                angle += 1;
                targetRotation =  -angle / 2 * Math.PI;
                rotate = true;
                rotateTime = chs.Timer.time + lerpTime;
            } else if (ve && !ho) {
                if (yvel > 0) {
                    if (!standing) {
                        xvel = 0;
                    }
                    standing = true;
                    jumping = false;
                }
                yvel = 0;
            } else if (ho && ve) {
                xvel = 0;
                yvel = 0;
            } else if (bo) {
                if (yvel > 0) {
                    standing = true;
                    jumping = false;
                    xvel = 0;
                }
                yvel = 0;
            }

            this.x += xvel;
            this.y += yvel;

            this.xvel = xvel;
            this.yvel = yvel;
        },

        onUpdate: function(time, deltaTime) {
            var dt = deltaTime;
            if (space && standing === true && !rotate) {
                this.xvel = 0.35;
            } else if (jump && !jumping && !rotate) {
                this.yvel = -0.85;
                jump = false;
                jumping = true;
                standing = false;
            }
            if (!rotate) {
                while (dt > 0) {
                    this.move(Math.min(1, dt));
                    dt -= 1;
                }
                this.yvel += deltaTime * gravity;
            }
        },

        onDraw: function(context) {
            context.fillStyle = 'black';
            context.fillRect(0.5, 0.5, this.width - 0.5, this.height - 0.5);
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

            board = [];

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
            board[2 + 5 * board_width] = 1;
            board[2 + 6 * board_width] = 1;
            board[3 + 5 * board_width] = 1;
            board[3 + 6 * board_width] = 1;

            this.player = new mtw.Player();
            this.addChild(this.player);
        },

        onUpdate: function(time, deltaTime) {
            var dt;
            chs.Debug.print(Math.floor(this.rotation * 180 / Math.PI));

            if (rotate) {
                dt = (rotateTime - time) / lerpTime;
                if (dt <= 0) {
                    rotate = false;
                    angle &= 3;
                    this.rotation = -angle / 2 * Math.PI;
                } else {
                    dt = chs.Util.ease(chs.Util.ease(dt));
                    this.rotation = targetRotation + (currentRotation - targetRotation) * dt;
                }
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

}());