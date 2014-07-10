window.onload = function() {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var screen_width = 640,
        screen_height = 480,
        bat_width = 100,
        bat_height = 10,
        brick_colours = [
            "rgb(255, 64, 32)",
            "rgb(16, 224, 0)",
            "rgb(16, 96, 255)",
            "rgb(255, 255, 0)" ],
        bat_y = screen_height - bat_height * 2,
        bat_colour = "white",
        brick_rows = brick_colours.length,
        brick_columns = 12,
        brick_width = screen_width / brick_columns,
        brick_height = 30;

    //////////////////////////////////////////////////////////////////////

    var Bat = glib.Class({ inherit$: glib.SolidRectangle,

        $: function(game) {
            glib.SolidRectangle.call(this, game.width / 2, bat_y, bat_width, bat_height, 4, bat_colour);
            this.setPivot(0.5, 0);
            this.setCapture(true);
        },

        onMouseMove: function(e) {
            this.setPosition(glib.Util.constrain(e.x, bat_width / 2, this.parent.width - bat_width / 2), bat_y);
        }
    });

    //////////////////////////////////////////////////////////////////////

    var Ball = glib.Class({ inherit$: glib.Sprite,

        $: function(game, x, y, image) {
            glib.Sprite.call(this, image);
            this.setPivot(0.5, 0.5);
            this.setPosition(x, y);
            this.game = game;
            this.xvel = 0;
            this.yvel = 0;
            this.age = 0;
            this.collisions = 0;
            this.onUpdate = this.stickToBat;
            this.dead = false;
            this.setScale(0.4);
        },

        launch: function(xvel, yvel) {
            this.xvel = xvel;
            this.yvel = yvel;
            this.onUpdate = this.move;
        },

        freeze: function() {
            this.onUpdate = this.frozen;
        },

        frozen: function(time, deltaTime) {
        },

        stickToBat: function(time, deltaTime) {
            this.x = this.game.bat.x - (this.game.width / 2 - this.game.bat.x) / (this.game.width / this.game.bat.width);
        },

        speed: glib.Property({
            get: function() {
                return (((this.collisions + 4) / 5) >>> 0) + 4;
            }
        }),

        move: function(time, deltaTime) {
            for (var i = 0; i < this.speed && !this.dead; ++i) {
                this.moveAndCollide(deltaTime);
            }
        },

        moveAndCollide: function(deltaTime) {
            var i, b, h, v, hb, vb, removeBrick, diff, oy;
            oy = this.y;
            hb = false;
            vb = false;
            for(i = 0; i < this.game.bricks.length; ++i) {
                b = this.game.bricks[i];
                removeBrick = false;
                if (!hb) {
                    if (this.checkBrick(this.x + this.xvel * deltaTime, this.y, b)) {
                        hb = true;
                        removeBrick = true;
                    }
                }
                if (!vb) {
                    if (this.checkBrick(this.x, this.y + this.yvel * deltaTime, b)) {
                        vb = true;
                        removeBrick = true;
                    }
                }
                if (removeBrick) {
                    this.collisions += 1;
                    this.game.delete(b, this.game.bricks);
                    this.game.score += this.speed * this.game.balls.length;
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
                    this.xvel = diff / bat_width / 5;
                    vb = true;
                }
            }
            if (hb) {
                this.xvel = -this.xvel;
            }
            if (vb) {
                this.yvel = -this.yvel;
            }
            this.x += this.xvel * deltaTime;
            this.y += this.yvel * deltaTime;

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

    var Brick = glib.Class({ inherit$: glib.SolidRectangle,

        $: function(game, x, y, colour, ballImage) {
            glib.SolidRectangle.call(this, x + 1, y + 1, brick_width - 2, brick_height - 2, 2, colour);
            this.game = game;
            if (ballImage) {
                this.ball = new Ball(game, this.width / 2, this.height / 2, ballImage);
                this.ball.zIndex = 1;
                this.ball.freeze();
                this.addChild(this.ball);
            }
        },

        onClosed: function() {
            var angle,
                ballPos;
            if (this.ball) {
                this.removeChild(this.ball);
                ballPos = this.ball.clientToScreen(this.ball);
                ballPos = this.game.screenToClient(ballPos);
                this.ball.setPosition(ballPos.x, ballPos.y);
                angle = Math.random() * Math.PI / 4 - Math.PI / 8;
                this.ball.launch(Math.sin(angle) * 0.05, Math.cos(angle) * 0.05);
                this.game.addBall(this.ball);
                this.ball = null;
            }
        }

    });

    //////////////////////////////////////////////////////////////////////

    var Game = glib.Class({ inherit$: glib.Drawable,

        $: function() {
            glib.Drawable.call(this);
            this.size = playfield.size;
            this.loader = new glib.Loader("img/");
            this.font = glib.Font.load("Consolas", this.loader);
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

            this.scoreLabel = new glib.Label("Score: 0", this.font).setPosition(10, 10);
            this.addChild(this.scoreLabel);

            this.banner = new glib.Label("Click to launch", this.font).setPosition(this.width / 2, this.height / 2).setPivot(0.5, 0.5);
            this.banner.visible = true;
            this.addChild(this.banner);

            this.livesLabel = new glib.Label("Lives: 3", this.font).setPosition(this.width - 10, 10).setPivot(1, 0);
            this.addChild(this.livesLabel);

            this.stuckBall = null;
            this.balls = [];
            this.bricks = [];
            this.reset();
            this.enabled = true;
        },

        reset: function() {
            var x, y,
                b,
                ballColumn,
                brickX,
                brickY;
            this.score = 0;
            this.lives = 3;
            this.banner.text = "Click to launch";
            while (this.balls.length > 0) {
                this.removeChild(this.balls.pop());
            }
            while (this.bricks.length > 0) {
                this.removeChild(this.bricks.pop());
            }
            for (y = 0; y < brick_rows; ++y) {
                ballColumn = (Math.random() * brick_columns) >>> 0;
                for (x = 0; x < brick_columns; ++x) {
                    brickX = x * brick_width;
                    brickY = (y + 2) * brick_height;
                    b = new Brick(this, brickX, brickY, brick_colours[y], x === ballColumn ? this.ballImage : null);
                    this.addChild(b);
                    this.bricks.push(b);
                }
            }
            this.createBall();
        },

        onUpdate: function(time, deltaTime) {
            this.scoreLabel.text = "Score: " + this.score.toString();
            this.livesLabel.text = "Lives: " + this.lives.toString();
            if (this.bricks.length === 0) {
                this.banner.visible = true;
                while (this.balls.length > 0) {
                    this.balls[0].visible = false;
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
                    this.banner.visible = true;
                }
            }
        },

        addBall: function(ball) {
            this.balls.push(ball);
            this.addChild(ball);
            ball.addEventHandler("miss", this.missed, this);
        },

        createBall: function() {
            this.stuckBall = new Ball(this, this.bat.x, this.bat.y - bat_height, this.ballImage);
            this.addBall(this.stuckBall);
        },

        onLeftMouseDown: function(e) {
            if (this.stuckBall !== null) {
                this.stuckBall.launch((this.stuckBall.x - this.bat.x) / bat_width / 5, -0.05);
                this.stuckBall = null;
                this.banner.text = "Game Over";
                this.banner.visible = false;
            } else if (this.banner.visible) {
                this.reset();
            }
        }

    });

    var playfield = new glib.Playfield(640, 480, "rgb(8, 8, 64)");
    playfield.addChild(new Game());
};
