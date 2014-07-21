/////////////////////////////////////////////////////////////////////

window.onload = function () {
    "use strict";

    var font,
        loader,
        playfield,
        game,
        starfield,
        ship,
        ui,
        moneyPointer,
        clip,
        powerupBar,
        bulletImage,
        laserImage;

    /////////////////////////////////////////////////////////////////////

    var Starfield = glib.Class({ inherit$: glib.Drawable,

        static$: {
            image: null,
            load: function() {
                Starfield.image = loader.load("blob.png");
            }
        },

        $: function(numStars) {
            var i,
                star,
                x,y;
            glib.Drawable.call(this);
            this.numStars = numStars;
            this.width = playfield.width;
            this.height = playfield.height;
            this.random = new glib.Random();
            this.stars = [];
            for (i = 0; i < this.numStars; ++i) {
                y = this.random.next() % this.height;
                x = this.width - (i * (this.width + Starfield.image.height) / this.numStars - Starfield.image.width / 2);
                star = new glib.Sprite(Starfield.image).setPivot(0.5, 0.5).setPosition(x, y);
                star.period = this.random.next() % 16 + 16;
                star.speed = this.random.next() % 15 + 20;
                this.stars.push(star);
                this.addChild(star);
            }
        },

        onUpdate: function(time, deltaTime) {
            var i,
                star;
            for (i = 0; i < this.numStars; ++i) {
                star = this.stars[i];
                star.x = (star.x - deltaTime / star.speed);
                star.setScale(Math.sin(star.x / this.height * Math.PI * 2 * star.period) * 0.05 + 0.1);
                if (star.x < -star.height / 2) {
                    star.y = this.random.next() % this.height;
                    star.x = this.width + star.width / 2;
                    star.period = this.random.next() % 16 + 16;
                    star.speed = this.random.next() % 15 + 20;
                }
            }
        }
    });

    /////////////////////////////////////////////////////////////////////

    var Bullet = glib.Class({ inherit$: glib.Sprite,

        static$: {
            image: null,
            load: function() {
                Bullet.image = loader.load("blob.png");
            }
        },

        // add image option?
        $: function(x, y, xvel, yvel) {
            glib.Sprite.call(this, Bullet.image);
            this.setPosition(x, y);
            this.xvel = xvel;
            this.yvel = yvel;
        },

        onUpdate: function(time, deltaTime) {
            this.x += this.xvel * deltaTime;
            this.y += this.yvel * deltaTime;
            if (this.x < -this.width / 2 ||
                this.y < -this.height / 2 ||
                this.x > playfield.width + this.width / 2 ||
                this.y > playfield.height + this.height / 2) {
                this.close();
            } else if (this.overlaps(ship)) {
                ship.hit += 1;
            }
        }
    });

    /////////////////////////////////////////////////////////////////////

    var clipSize = 20,                                  // default clip size
        maxClipSize = 60,                               // clip can grow to this
        clipGrow = 10,                                  // grow the clip by this when they buy 'Big Clip'
        defaultReloadDelay = 500,                       // default reload rate
        reloadDelayDecrement = -50,                     // get faster by this when they buy 'Fast Reload'
        minReloadDelay = 300;                           // fastest it can get

    var Clip = glib.Class({ inherit$: glib.Drawable,

        $: function() {
            glib.Drawable.call(this);
            this.setPosition(10, 10);
            this.bullets = clipSize;
            this.clipSize = clipSize;
            this.reloadDelay = defaultReloadDelay;
            this.increment = 0;
        },

        onDraw: function(context) {
            font.renderString(context, glib.Util.pad(this.bullets, 2) + " of " + glib.Util.pad(this.clipSize, 2), 0, 0);
        },

        onUpdate: function(time, deltaTime) {
            this.increment += deltaTime;
            if (this.increment >= this.reloadDelay) {
                this.bullets = Math.min(this.clipSize, this.bullets + 1);
                this.increment = this.reloadDelay / 2;
            }
        },

        speedUp: function() {
            this.reloadDelay = Math.max(minReloadDelay, this.reloadDelay - reloadDelayDecrement);
        },

        deplete: function() {
            this.bullets = Math.max(0, this.bullets - 1);
            this.increment = 0;
        }
    });

    /////////////////////////////////////////////////////////////////////

    var Money = glib.Class({ inherit$: glib.Sprite,

        static$: {
            image: null,
            load: function() {
                Money.image = loader.load("blob.png");
            }
        },

        $: function(x, y) {
            glib.Sprite.call(this, Money.image);
            this.yorg = y;
            this.age = 10000;
            this.setPosition(x, y);
        },

        onUpdate: function(time, deltaTime) {
            this.age = Math.max(0, this.age - deltaTime);
            this.x -= deltaTime / 1000 * 2;
            this.y = Math.sin(time / 1000 + this.x / 10 + this.yorg / 10) * this.age / 1000;
            if (this.overlaps(ship)) {
                moneyPointer.add(this);
            }
        }
    });

    /////////////////////////////////////////////////////////////////////

    var MoneyPointer = glib.Class({ inherit$: glib.Drawable,

        $: function() {
            glib.Drawable.call(this);
        },

        add: function(money) {

        }

    });

    /////////////////////////////////////////////////////////////////////

    var powerUps = [
        { name: "Speed", price: 300, action: function() {
            ship.speed = Math.min(3, ship.speed + 1);
        } },
        { name: "Shield", price: 300, action: function() {
            ship.activateShield();
        } },
        { name: "Big Clip", price: 400, action: function() {
            clipSize = Math.min(maxClipSize, clipSize + clipGrow);
        } },
        { name: "Fast Charge", price: 600, action: function() {
            clip.speedUp();
        } },
        { name: "Double Shot", price: 600, action: function() {
            ship.startDoubleShot();
        } },
        { name: "Laser", price: 600, action: function() {
            ship.startLaser();
        } },
        { name: "Multiple", price: 800, action: function() {
            ship.addMultiple();
        } },
        { name: "Smart", price: 300, action: function() {
            doSmartBomb();
        } }
    ];

    /////////////////////////////////////////////////////////////////////

    var PowerUpLabel = glib.Class({ inherit$: glib.Panel,

        $: function(x, y, w, h, text) {
            glib.Panel.call(this, x, y, w, h, "black", "white", 0, 2);
            this.addChild(new glib.Label(text, font)).setPosition(this.width / 2, this.height / 2).setPivot(0.5, 0.5);
        }

    });

    /////////////////////////////////////////////////////////////////////

    var PowerUpBar = glib.Class({ inherit$: glib.Drawable,

        $: function() {
            glib.Drawable.call(this);
            var i, t = 0, x, label;
            for (i = 0; i < powerUps.length; ++i) {
                t += powerUps[i].price;
            }
            this.width = playfield.width - 20;
            this.height = font.height + 4;
            t = this.width / t;

            this.labels = [];
            x = 0;
            for (i = 0; i < powerUps.length; ++i) {
                label = new PowerUpLabel(x, 0, powerUps[i].price * t, this.height, powerUps[i].name);
                this.labels.push(label);
                this.addChild(label);
                x += label.width;
            }
            this.setPosition(10, playfield.height - this.height - 10);
        }
    });

    /////////////////////////////////////////////////////////////////////

    var Projectile = glib.Class({ inherit$: glib.Sprite,

        $: function(x, y, speed, image, lives) {
            glib.Sprite.call(this, image);
            this.setPosition(x, y);
            this.speed = speed;
            this.lives = lives;
            this.x += this.speed * 1000/60;
        },

        onUpdate: function(time, deltaTime) {
            this.x += this.speed * deltaTime;
            if (this.x > playfield.width) {
                this.close();
            }
        }
    });

    /////////////////////////////////////////////////////////////////////

    var StandardProjectile = glib.Class({ inherit$: Projectile,

        $: function(x, y) {
            Projectile.call(this, x, y, 2000 / 1000, bulletImage, 1);
            this.setScale(1.85, 0.15);
            this.setPivot(0.5, 0.5);
        }
    });

    /////////////////////////////////////////////////////////////////////

    var LaserProjectile = glib.Class({ inherit$: Projectile,

        $: function(x, y) {
            Projectile.call(this, x, y, 20, laserImage, 3);
        }
    });

    /////////////////////////////////////////////////////////////////////

    var Multiple = glib.Class({ inherit$: glib.Sprite,

        $: function() {

        }
    });

    /////////////////////////////////////////////////////////////////////

    var shotDelay = 100;    // ms between shots

    var Ship = glib.Class({ inherit$: glib.Sprite,

        static$: {
            image: null,

            load: function() {
                Ship.image = loader.load("blob.png");
            }
        },

        $: function() {
            glib.Sprite.call(this, Ship.image);
            this.setPosition(playfield.width / 2, playfield.height / 2);
            this.setPivot(0.5, 0.5);
            this.speed = 0.1;
            this.hit = 0;
            this.shotTime = 0;
            this.multiples = [];
        },

        fireBullet: function() {
            game.addChild(new StandardProjectile(this.x, this.y));
        },

        onUpdate: function(time, deltaTime) {
            var x = 0,
                y = 0,
                v = this.speed * deltaTime;
            this.shotTime -= deltaTime;
            if (glib.Keyboard.held("left")) { x -= 4; }
            if (glib.Keyboard.held("right")) { x += 4; }
            if (glib.Keyboard.held("up")) { y -= 4; }
            if (glib.Keyboard.held("down")) { y += 4; }
            this.x = glib.Util.constrain(this.x + x * v, 0, playfield.width);
            this.y = glib.Util.constrain(this.y + y * v, 0, playfield.height);
            if (glib.Keyboard.held("shift") && this.shotTime <= 0 && clip.bullets > 0) {
                this.fireBullet();
                clip.deplete();
                this.shotTime = shotDelay;
            }
        }
    });

    /////////////////////////////////////////////////////////////////////

    var Enemy = glib.Class({ inherit$: glib.Sprite,

        $: function(image) {
            glib.Sprite.call(this, image);
        }
    });

    /////////////////////////////////////////////////////////////////////

    var Wave = glib.Class({ inherit$: glib.Drawable,

        $: function(image) {
            // create the enemies as children
            // add 'closed' event handler
        }

    });

    /////////////////////////////////////////////////////////////////////

    function onResize() {
        document.body.style.width = window.innerWidth + "px";
        document.body.style.height = window.innerHeight + "px";
    }

    /////////////////////////////////////////////////////////////////////

    document.body.style.position = "absolute";
    document.body.style.margin = "0px";
    document.body.style.padding = "0px";
    document.body.style.left = "0px";
    document.body.style.top = "0px";
    window.addEventListener("resize", onResize, false);
    onResize();
    playfield = new glib.Playfield({
        width: 1280,
        height: 720,
        backgroundColour: "rgb(8, 8, 64)",
        autoCenter: true,
        DOMContainer: document.body
    });
    loader = new glib.Loader("img/");
    font = glib.Font.load("Consolas", loader);
    Starfield.load();
    Ship.load();
    bulletImage = loader.load("blob.png");
    laserImage = loader.load("blob.png");
    loader.addEventHandler("complete", function() {
        game = playfield.addChild(new glib.Drawable().setSize(playfield.width, playfield.height));
        ui = playfield.addChild(new glib.Drawable().setSize(playfield.width, playfield.height));
        starfield = game.addChild(new Starfield(150));
        ship = game.addChild(new Ship());
        clip = ui.addChild(new Clip());
        powerupBar = ui.addChild(new PowerUpBar());
    }, true);
    loader.start();
};
