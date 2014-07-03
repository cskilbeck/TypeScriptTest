//////////////////////////////////////////////////////////////////////

var breakout = (function(){
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var screen_width = 640;
    var screen_height = 480;
    var bat_width = 100;
    var bat_height = 10;
    var bat_y = screen_height - bat_height * 2;
    var bat_colour = "white";
    var ball_width = 10;
    var ball_height = 10;
    var brick_rows = 4;
    var brick_columns = 12;
    var brick_width = screen_width / brick_columns;
    var brick_height = 30;
    var brick_colours = [
            [255, 64, 32],
            [0, 255, 0],
            [32, 128, 255],
            [255, 255, 0]
        ];

    //////////////////////////////////////////////////////////////////////

    var Ball = chs.Class({ inherit$: chs.Sprite,

        $: function(game, x, y, image) {
            chs.Sprite.call(this, image);
            this.setPivot(0.5, 0.5);
            this.setPosition(x, y);
            this.game = game;
            this.stuck = true;
            this.xvel = 0;
            this.yvel = 0;
            this.age = 0;
            this.speed = 2;
            this.speedUp = 3;
            this.onUpdate = this.stickToBat;
        },

        launch: function() {
            this.onUpdate = this.moveAndCollide;
        },

        stickToBat: function(time, deltaTime) {
            this.x = this.game.bat.x + bat_width / 2;
        },

        moveAndCollide: function(time, deltaTime) {
            var i, b, h, v, hb, vb, removeBrick;
            hb = false;
            vb = false;
            for(i = 0; i < this.game.bricks.length; ++i) {
                b = this.game.bricks[i];
                removeBrick = false;
                if (!hb) {
                    if (this.checkBrick(this.x + this.xvel, this.y, b)) {
                        hb = true;
                        removeBrick = true;
                    }
                }
                if (!vb) {
                    if (this.checkBrick(this.x, this.y + this.yvel, b)) {
                        vb = true;
                        removeBrick = true;
                    }
                }
                if (removeBrick) {
                    this.game.removeBrick(b);
                    this.score += 1;
                }
                if (hb && vb) {
                    break;
                }
            }
            if (x < 0 || x >= screen_width) {
                hb = true;
            }
            if (y < 0) {
                vb = true;
            }

            if (hb) {
                this.xvel = -this.xvel;
            }
            if (vb) {
                this.yvel = -this.yvel;
            }
            this.x += this.xvel;
            this.y += this.yvel;
        },

        checkBrick: function(x, y, brick) {
            return  (x < (brick.x + brick_width) && x >= brick.x) || (y < (brick.y + brick_height) && y >= brick.y);
        },

    });

    //////////////////////////////////////////////////////////////////////

    return chs.Class({ inherit$: chs.Drawable,

        $: function(desktop) {
            chs.Drawable.call(this);
            this.size = desktop.size;
            this.loader = new chs.Loader("img/");
            this.font = chs.Font.load("Consolas", this.loader);
            this.ballImage = this.loader.load("blob.png");
            this.loader.addEventHandler("complete", this.init);
            this.enabled = false;
            this.loader.start();
        },

        init: function() {
            this.bat = new chs.SolidRectangle(this.width / 2 - bat_width / 2, this.height - 10 - bat_height, bat_width, bat_height, 0, "white");
            this.addChild(this.bat);

            this.score = new chs.Label("Score: 0", this.font).setPosition(10, 10);
            this.addChild(this.score);

            this.lives = new chs.Label("Lives: 3", this.font).setPosition(this.width - 10, 10).setPivot(1, 0);
            this.addChild(this.lives);

            this.balls = [];
            this.bricks = [];
            this.reset();
            this.enabled = true;
        },

        removeBalls: function() {
            while (this.balls.length > 0) {
                this.removeChild(balls.pop());
            }
        },

        removeBricks: function() {
            while (this.bricks.length > 0) {
                this.removeChild(bricks.pop());
            }
        },

        deleteBrick: function(b) {
            var i = this.bricks.indexOf(b);
            if (i !== -1) {
                this.removeChild(b);
                this.bricks.splice(i, 1);
            }
        },

        createBricks: function() {
            var x, y,
                b;

            for (y = 0; y < brick_rows; ++y) {
                for (x = 0; x < brick_columns; ++x) {
                    b = new chs.SolidRectangle(x * brick_width, y * brick_height, brick_width, brich_height, 0, brick_colours[y]);
                    this.addChild(b);
                    bricks.push(b);
                }
            }
        },

        reset: function() {
            this.score = 0;
            this.speed = 1;
            this.lives = 3;
            this.brickScore = 1;
            this.removeBalls();
            this.removeBricks();
            this.createBricks();
            this.createBall();
        },

        onMouseMove: function(e) {
            var p = this.screenToClient(e);
            this.bat.setPosition(p.x, bat_y);
        }
    });

}());

    //////////////////////////////////////////////////////////////////////

function main(desktop) {
    "use strict";

    desktop.width = screen_width;
    desktop.height = screen_height;
    desktop.addChild(new breakout(desktop));
}