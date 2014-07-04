//////////////////////////////////////////////////////////////////////

function main(desktop) {
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
            "rgb(255, 255, 0)" ];

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
            this.collisions = 0;
            this.speedUp = 4;
            this.onUpdate = this.stickToBat;
            this.dead = false;
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
            for (var i = 0; i < this.speed && !this.dead; ++i) {
                this.speed = (((this.collisions + 2) / 3) >>> 0) + 4;
                this.moveAndCollide();
            }
        },

        moveAndCollide: function() {
            var i, b, h, v, hb, vb, removeBrick, diff, oy;
            oy = this.y;
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
                    this.collisions += 1;
                    this.game.delete(b, this.game.bricks);
                    this.game.score += this.speed;
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
            if (this.yvel > 0 && this.y >= bat_y && this.y < bat_y + bat_height) {
                diff = this.x - this.game.bat.x;
                if (diff >= -bat_width / 2 && diff <= bat_width / 2) {
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

            if (this.y > this.parent.height) {
                this.dispatchEvent("miss", this);
                this.dead = true;
            }
        },

        checkBrick: function(x, y, brick) {
            return  x < (brick.x + brick_width) && x >= brick.x &&
                    y < (brick.y + brick_height) && y >= brick.y;
        }

    });

    //////////////////////////////////////////////////////////////////////

    var Game = chs.Class({ inherit$: chs.Drawable,

        $: function(desktop) {
            chs.Drawable.call(this);
            desktop.width = screen_width;
            desktop.height = screen_height;
            desktop.fillColour = "rgb(8, 8, 64)";
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

            this.scoreLabel = new chs.Label("Score: 0", this.font).setPosition(10, 10);
            this.addChild(this.scoreLabel);

            this.gameOver = new chs.Label("Game Over", this.font).setPosition(this.width / 2, this.height / 2).setPivot(0.5, 0.5);
            this.gameOver.visible = false;
            this.addChild(this.gameOver);

            this.livesLabel = new chs.Label("Lives: 3", this.font).setPosition(this.width - 10, 10).setPivot(1, 0);
            this.addChild(this.livesLabel);

            this.stuckBall = null;
            this.balls = [];
            this.bricks = [];
            this.reset();
            this.enabled = true;
        },

        score: chs.Property({
            get: function() {
                return this.myscore;
            },
            set: function(s) {
                this.myscore = s;
                this.scoreChanged = true;
            }
        }),

        lives: chs.Property({
            get: function() {
                return this.mylives;
            },
            set: function(l) {
                this.mylives = l;
                this.livesChanged = true;
            }
        }),

        reset: function() {
            var x, y,
                b,
                brickX,
                brickY;
            this.scoreChanged = false;
            this.livesChanged = false;
            this.score = 0;
            this.lives = 3;
            this.gameOver.visible = false;
            while (this.balls.length > 0) {
                this.removeChild(this.balls.pop());
            }
            while (this.bricks.length > 0) {
                this.removeChild(this.bricks.pop());
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
            if (this.scoreChanged) {
                this.scoreLabel.text = "Score: " + this.myscore.toString();
                this.scoreChanged = false;
            }
            if (this.livesChanged) {
                this.livesLabel.text = "Lives: " + this.mylives.toString();
                this.livesChanged = false;
            }
            if (this.bricks.length === 0) {
                this.gameOver.visible = true;
                while (this.balls.length > 0) {
                    this.delete(this.balls[0], this.balls);
                }
            }
        },

        delete: function(b, arr) {
            var i = arr.indexOf(b);
            if (i !== -1) {
                b.close();
                arr.splice(i, 1);
            }
        },

        missed: function(ball) {
            this.delete(ball, this.balls);
            if (this.balls.length === 0) {
                this.lives -= 1;
                if (this.lives > 0) {
                    this.createBall();
                } else {
                    this.gameOver.visible = true;
                }
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
            } else if (this.gameOver.visible) {
                this.reset();
            }
        }

    });

    desktop.addChild(new Game(desktop));
}