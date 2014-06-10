(function (){
    "use strict";

    var board_width = 8,
        board_height = 8,
        board_size = board_width * board_height,
        cell_width = 32,
        cell_height = 32,
        flash = 0,
        age,
        board_width_in_pixels = board_width * cell_width,
        board_height_in_pixels = board_height * cell_height,
        colours = [
            "white",
            "rgb(255,0,0)",
            "rgb(0,255,0)"
//            "rgb(0,0,255)"
        ],
        board = [],
        free_slots = [],
        direction = null;

    function shunt (start_x, end_x, x_delta, start_y, end_y, y_delta, cell_offset) {
        var x,
            y,
            bo,
            shunted = false,
            cell1,
            cell2;

        for (x = start_x; x !== end_x; x += x_delta) {
            for (y = start_y; y !== end_y; y += y_delta) {
                bo = x + y * board_width;
                cell1 = board[bo];
                cell2 = board[bo + cell_offset];
                if (cell1 === 0 && cell2 !== 0) {
                    board[bo] = cell2;
                    board[bo + cell_offset] = 0;
                    shunted = true;
                }
            }
        }
        return shunted;
    }

    function span_scan(x, y) {
        var cell = board[x + y * board_width],
            right = x + 1;
        if (cell !== 0) {
            while (right < board_width && board[right + y * board_width] === cell) {
                ++right;
            }
            return { width: right - x, colour: cell };
        }
        return { width: 0, colour: 0 };
    }

    function scanForRectangles() {
        var found = 0,
            x,
            y,
            scan,
            scan2,
            colour,
            width = 0,
            height,
            w,
            z,
            p,
            q;
        for (y = 0; y < board_height; ++y) {
            for (x = 0; x < board_width - 1; ++x) {
                scan = span_scan(x, y);
                if (scan.width > 1) {
                    for (z = y + 1; z < board_height; ++z) {
                        scan2 = span_scan(x, z);
                        if (scan2.colour === scan.colour && scan2.width > 1) {
                            width = Math.min(scan.width, scan2.width);
                        } else {
                            height = (z - y);
                            break;
                        }
                    }
                    if (width > 1 && height > 1) {
                        ++found;
                        for (p = 0; p < width; ++p) {
                            for (q = 0; q < height; ++q) {
                                board[(x + p) + (y + q) * board_width] *= -1;
                            }
                        }
                    }
                }
            }
        }
        return found;
    }

    function addRandomBlocks(n) {
        var i,
            j = 0;
        while (n-- > 0) {
            for (i = 0; i < board_size; ++i) {
                if (board[i] === 0) {
                    free_slots[j++] = i;
                }
            }
            if(j > 0) {
                i = (Math.random() * j) >>> 0;
                board[free_slots[i]] = ((Math.random() * (colours.length - 1)) >>> 0) + 1;
            } else {
                break;  // game_over
            }
        }
    }

    mtw.Tripple = chs.Class({inherit$: chs.Drawable,

        $: function() {
            var i;
            chs.Drawable.call(this);
            this.width = board_width * cell_width;
            this.height = board_height * cell_height;
            this.setPivot(0.5, 0.5);
            this.setPosition(chs.desktop.width / 2, chs.desktop.height / 2);
            for (i = 0; i < board_size; ++i) {
                board[i] = 0;
                free_slots[i] = 0;
            }
            board[0 + 5 * board_width] = 1;
            board[0 + 6 * board_width] = 1;
            board[1 + 5 * board_width] = 1;
            board[1 + 6 * board_width] = 1;

            this.onUpdate = this.waitForKeyPress;
        },

        onKeyDown: function(e) {
            if (direction === null) {
                direction = e.name;
                this.onUpdate = this.doShunt;
            }
        },

        onUpdate: function(time, deltaTime) {
        },

        waitForKeyPress: function(time, deltaTime) {
        },

        doShunt: function(time, deltaTime) {
            var found,
                shunted;
            switch(direction) {
                case 'up':
                    shunted = shunt(0, board_width, 1, 0, board_height - 1, 1, board_width);
                    break;
                case 'down':
                    shunted = shunt(0, board_width, 1, board_height - 1, 0, -1, -board_width);
                    break;
                case 'left':
                    shunted = shunt(0, board_width - 1, 1, 0, board_height, 1, 1);
                    break;
                case 'right':
                    shunted = shunt(board_width - 1, 0, -1, 0, board_height, 1, -1);
                    break;
            }
            if (!shunted) {
                found = scanForRectangles();
                if (found > 0) {
                    this.onUpdate = this.fadeRectangles;
                    age = time;
                } else {
                    addRandomBlocks(2);
                    this.onUpdate = this.waitForKeyPress;
                    direction = null;
                }
            }
        },

        fadeRectangles: function(time, deltaTime) {
            var x;
            if (time - age > 250) {
                for (x = 0; x < board_size; ++x) {
                    if (board[x] < 0) {
                        board[x] = 0;
                    }
                }
                this.onUpdate = this.doShunt;
            }
        },

        onDraw: function(context) {
            var x,
                y,
                cell;
            flash = 1 - flash;
            for (y = 0; y < board_height; ++y) {
                for (x = 0; x < board_width; ++x) {
                    cell = board[x + y * board_width];
                    if (cell < 0) {
                        cell *= -flash;
                    }
                    context.fillStyle = colours[cell];
                    context.fillRect(x * cell_width, y * cell_height, cell_width - 1, cell_height - 1);
                }
            }
        }
    });

}());