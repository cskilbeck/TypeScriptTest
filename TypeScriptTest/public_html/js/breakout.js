//////////////////////////////////////////////////////////////////////

var breakout = (function(){
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var screen_width = 640,
        screen_height = 480,
        bat_width = 100,
        bat_height = 10,
        bat_y = screen_height - bat_height * 2,
        bat_colour = "white",
        brick_rows = 4,
        brick_columns = 12,
        brick_width = screen_width / brick_columns,
        brick_height = 30,
        brick_colours = [
            "rgb(255, 64, 32)",
            "rgb(16, 224, 0)",
            "rgb(16, 96, 255)",
            "rgb(255, 255, )" ];

    //////////////////////////////////////////////////////////////////////

    var Bat = chs.Class({ inherit$: chs.SolidRectangle,

        $: function(game) {
            chs.SolidRectangle.call(this, game.width / 2, bat_y, bat_width, bat_height, 4, bat_colour);
            this.setPivot(0.5, 0);
            this.setCapture(true);
        },

        onMouseMove: function(e) {
            this.setPosition(chs.Util.constrain(e.x, 5, this.parent.width - 10), bat_y);
        }
    });

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
            this.speed = 4;
            this.speedUp = 3;
            this.onUpdate = this.stickToBat;
            this.setScale(0.4);
        },

        launch: function() {
            this.onUpdate = this.move;
            this.xvel = 0.5;
            this.yvel = -0.5;
        },

        stickToBat: function(time, deltaTime) {
            this.x = this.game.bat.x;
        },

        move: function(time, deltaTime) {
            var i;
            for (i = 0; i < this.speed; ++i) {
                this.moveAndCollide();
            }
        },

        moveAndCollide: function() {
            var i, b, h, v, hb, vb, removeBrick, diff;
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
                    this.game.deleteBrick(b);
                    this.score += 1;
                }
                if (hb && vb) {
                    break;
                }
            }
            if (this.x < 0 || this.x >= screen_width) {
                hb = true;
            }
            if (this.y < 0) {
                vb = true;
            }
            if (this.y >= bat_y) {
                diff = this.x - this.game.bat.x;
                if (diff < -bat_width / 2 || diff > bat_width / 2) {
                    this.dispatchEvent("miss", this);
                } else {
                    this.xvel = diff * 0.05;
                    vb = true;
                }
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
            return  x < (brick.x + brick_width) && x >= brick.x &&
                    y < (brick.y + brick_height) && y >= brick.y;
        }

    });

    //////////////////////////////////////////////////////////////////////

    return chs.Class({ inherit$: chs.Drawable,

        $: function(desktop) {
            chs.Drawable.call(this);
            desktop.width = screen_width;
            desktop.height = screen_height;
            desktop.fillColour = "black";
            this.size = desktop.size;
            this.loader = new chs.Loader("img/");
            this.font = chs.Font.load("Consolas", this.loader);
            this.ballImage = this.loader.load("blob.png");
            this.loader.addEventHandler("complete", this.init, this);
            this.enabled = false;
            this.loader.start();
            this.setCapture(true);
        },

        init: function() {
            var batX = this.width / 2 - bat_width / 2,
                batY = this.height - 10 - bat_height;
            this.bat = new Bat(this);
            this.addChild(this.bat);

            this.score = new chs.Label("Score: 0", this.font).setPosition(10, 10);
            this.addChild(this.score);

            this.lives = new chs.Label("Lives: 3", this.font).setPosition(this.width - 10, 10).setPivot(1, 0);
            this.addChild(this.lives);

            this.stuckBall = null;
            this.balls = [];
            this.bricks = [];
            this.reset();
            this.enabled = true;
        },

        reset: function() {
            var x, y,
                b,
                brickX,
                brickY;
            this.score = 0;
            this.speed = 1;
            this.lives = 3;
            this.brickScore = 1;
            while (this.balls.length > 0) {
                this.removeChild(balls.pop());
            }
            while (this.bricks.length > 0) {
                this.removeChild(bricks.pop());
            }
            for (y = 0; y < brick_rows; ++y) {
                for (x = 0; x < brick_columns; ++x) {
                    brickX = x * brick_width;
                    brickY = (y + 2) * brick_height;
                    b = new chs.SolidRectangle(brickX + 1, brickY + 1, brick_width - 2, brick_height - 2, 0, brick_colours[y]);
                    this.addChild(b);
                    this.bricks.push(b);
                }
            }
            this.createBall();
        },

        onUpdate: function(time, deltaTime) {
            var i;
            for (i = 0; i < this.balls.length; ++i) {
                chs.Debug.print(this.balls[i].x.toFixed(0), this.balls[i].y.toFixed(0));
            }
        },

        deleteBall: function(b) {
            var i = this.balls.indexOf(b);
            if (i !== -1) {
                b.close();
                this.balls.splice(i, 1);
            }
        },

        deleteBrick: function(b) {
            var i = this.bricks.indexOf(b);
            if (i !== -1) {
                this.removeChild(b);
                this.bricks.splice(i, 1);
            }
        },

        missed: function(ball) {
            this.deleteBall(ball);
            this.lives -= 1;
            if (this.balls.length === 0) {
                this.createBall();
            }
        },

        createBall: function() {
            this.stuckBall = new Ball(this, this.bat.x, this.bat.y - bat_height, this.ballImage);
            this.addChild(this.stuckBall);
            this.stuckBall.addEventHandler("miss", this.missed, this);
        },

        onLeftMouseDown: function(e) {
            if (this.stuckBall !== null) {
                this.stuckBall.launch();
                this.balls.push(this.stuckBall);
                this.stuckBall = null;
            }
        }

    });

}());

    //////////////////////////////////////////////////////////////////////

function main(desktop) {
    "use strict";

    desktop.addChild(new breakout(desktop));
}