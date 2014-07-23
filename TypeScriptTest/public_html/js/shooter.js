/////////////////////////////////////////////////////////////////////
// Blank playfield
// Bouncing sprite
// Animating sprite
// Class
// Debug
// Mouse control
// Keyboard control
// Breakout
// Loader
// Fonts
// Label
// Pivot & Transforms
// addChild
// Events
// Picking
// Button
// Panel
// Timer
// Random
// Window
// Composite
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
        clip,
        moneyScale,
        bankBalance,
        maxBankBalance,
        moneyPointer,
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
                star.x -= deltaTime * star.speed;
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
        defaultReloadDelay = 0.5,                       // default reload rate
        reloadDelayDecrement = -0.05,                   // get faster by this when they buy 'Fast Reload'
        minReloadDelay = 0.3;                           // fastest it can get

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
                Money.image = loader.load("coin.png");
            }
        },

        $: function(x, y) {
            glib.Sprite.call(this, Money.image);
            this.frameWidth = 44;
            this.frameHeight = 40;
            this.framesWide = 10;
            this.framesHigh = 1;
            this.age = 0;
            this.setScale(0.5);
            this.setPivot(0.5, 0.5);
            this.setPosition(x, y);
        },

        onUpdate: function(time, deltaTime) {
            var dx, dy, d;
            this.x -= deltaTime * 60;
            if (this.x < -this.width / 4) {
                this.close();
            } else {
                this.y += Math.sin(time * 10 + this.x / 5) * 0.6;
                this.age += deltaTime;
                this.frame = this.age * 30 % this.framesWide;
                d = glib.Util.distance(this, ship);
                if (d < 20) {
                    bankBalance = Math.min(bankBalance + 100, maxBankBalance);
                    this.close();
                } else if (d < 80) {
                    dx = ship.x - this.x;
                    dy = ship.y - this.y;
                    d = 80 - d;
                    this.setScale(0.5 - (d / 320));
                    d *= d;
                    this.x += (d * dx * deltaTime) / 80;
                    this.y += (d * dy * deltaTime) / 80;
                }
            }
        }
    });

    /////////////////////////////////////////////////////////////////////

    var MoneyPointer = glib.Class({ inherit$: glib.Drawable,

        $: function() {
            glib.Drawable.call(this);
            this.setPosition(powerupBar.x, powerupBar.y - 14);
            this.arrow = this.addChild(new glib.SolidRectangle(0, 0, 20, 20, [10, 10, 0, 10], "yellow").setRotation(-Math.PI * 0.25).setPivot(0.5, 0.5));
        },

        onUpdate: function(time, deltaTime) {
            var x = bankBalance * moneyScale,
                d = x - this.arrow.x;
            if (Math.abs(d) < 2) {
                this.arrow.x = x;
            } else {
                this.arrow.x += d * deltaTime * 10;
            }
        }
    });

    /////////////////////////////////////////////////////////////////////
    // Powerups may accumulate to a max, but all reset to nothing when they drain...

    var powerUpIDs = {
        speed: 1,
        shield: 2,
        bigClip: 3,
        fastCharge: 4,
        doubleShot: 5,
        laser: 6,
        multiple: 7,
        smart: 8
    };

    var powerUps = [
        {
            name: "Speed",
            price: 300,
            drainTime: 60,
            context: ship,
            onbuy: function() {
                ship.speed = Math.min(shipMaxSpeed, ship.speed + 10);
            },
            onDrain: function() {
                ship.speed = shipMinSpeed;
            }
        },
        {
            name: "Shield",
            price: 300,
            drainTime: 30,
            context: ship,
            onbuy: function() {
               ship.activateShield();   // replenish shield which is degraded by bullets and doesn't work against enemies
            },
            onDrain: function() {
                ship.deactivateShield();
            }
        },
        {
            name: "Big Clip",
            price: 400,
            drainTime: 120,
            context: null,
            onbuy: function() {
                clipSize = Math.min(maxClipSize, clipSize + clipGrow);
            },
            onDrain: function() {
                clipSize = minClipSize;
            }
        },
        {
            name: "Fast Charge",
            price: 600,
            drainTime: 120,
            context: clip,
            onbuy: function() {
                clip.speedUp();
            }, onDrain: function() {
                clip.slowDown();
            }
        },
        {
            name: "Double Shot",
            price: 600,
            drainTime: 60,
            context: ship,
            onbuy: function() {
                ship.startDoubleShot();
            },
            onDrain: function() {
                ship.stopDoubleShot();
            }
        },
        {
            name: "Laser",
            price: 600,
            drainTime: 80,
            context: ship,
            onbuy: function() {
                ship.startLaser();
            },
            onDrain: function() {
                shop.stopLaser();
            }
        },
        {
            name: "Multiple",
            price: 800,
            drainTime: 240,
            context: ship,
            onbuy: function() {
                ship.addMultiple(); // add up to 3 - all disappear if it drains out!
            }, onDrain: function() {
                ship.removeAllMultiples();
            }
        },
        {
            name: "Smart",
            price: 300,
            drainTime: 120,
            context: null,
            onbuy: function() {
                enableSmartBullets();
            }, onDrain: function() {
                disableSmartBullets();
            }
        }
    ];

    /////////////////////////////////////////////////////////////////////

    var PowerUpLabel = glib.Class({ inherit$: glib.Panel,

        $: function(x, y, w, h, powerUp, baseMoney) {
            var xp = Math.floor(x) + 0.5;
            glib.Panel.call(this, xp, Math.floor(y) + 0.5, w, h, "black", "white", 0, 1);
            this.powerUp = powerUp;
            this.drain = this.addChild(new glib.SolidRectangle(xp + 1, y + 1, w - 2, 4, "yellow").setVisible(false));
            this.addChild(new glib.Label(powerUp.name, font)).setPosition(this.width / 2, this.height / 2).setPivot(0.5, font.midPivot);
            this.baseMoney = baseMoney;
            this.hover = false;
        },

        setFillColour: function() {
            if (bankBalance >= this.baseMoney) {
                if (this.hover) {
                    this.fillColour = "rgb(16, 224, 32)";
                } else {
                    this.fillColour = "rgb(8, 96, 16)";
                }
            } else {
                if (this.hover) {
                    this.fillColour = "rgb(80, 0, 0)";
                } else {
                    this.fillColour = "black";
                }
            }
        },

        onUpdate: function(time, deltaTime) {
            this.setFillColour();
        },

        onMouseEnter: function(e) {
            this.hover = true;
        },

        onMouseLeave: function(e) {
            this.hover = false;
        },

        onLeftMouseDown: function(e) {
            if (bankBalance >= this.baseMoney) {
                //this.powerUp.onBuy.call(this.powerUp.context);
                bankBalance = Math.max(0, bankBalance - this.powerUp.price);
            }
        }

    });

    /////////////////////////////////////////////////////////////////////

    var PowerUpBar = glib.Class({ inherit$: glib.Drawable,

        $: function() {
            var i, t = 0, x, label, baseMoney;
            glib.Drawable.call(this);
            for (i = 0; i < powerUps.length; ++i) {
                t += powerUps[i].price;
            }
            maxBankBalance = t;
            this.width = playfield.width - 20;
            this.height = font.height + 8;
            moneyScale = this.width / t;

            this.labels = [];
            x = 0;
            baseMoney = 0;
            for (i = 0; i < powerUps.length; ++i) {
                baseMoney += powerUps[i].price;
                label = new PowerUpLabel(x, 0, powerUps[i].price * moneyScale, this.height, powerUps[i], baseMoney);
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
            this.x += this.speed * 1/60;
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
            Projectile.call(this, x, y, 2000, bulletImage, 1);
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

    var shotDelay = 0.1;    // ms between shots

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
            this.speed = 50;
            this.hit = 0;
            this.shotTime = 0;
            this.multiples = [];
        },

        fireBullet: function() {
            game.addChild(new StandardProjectile(this.x, this.y));
        },

        speedUp: function() {
            this.speed = Math.min(120, this.speed + 10);
        },

        onUpdate: function(time, deltaTime) {
            var x = 0,
                y = 0,
                v = this.speed * deltaTime;
            this.shotTime -= deltaTime;
            if (glib.Keyboard.held("a")) { x -= 4; }
            if (glib.Keyboard.held("d")) { x += 4; }
            if (glib.Keyboard.held("w")) { y -= 4; }
            if (glib.Keyboard.held("s")) { y += 4; }
            this.x = glib.Util.constrain(this.x + x * v, 0, playfield.width);
            this.y = glib.Util.constrain(this.y + y * v, 0, playfield.height);
            if (glib.Mouse.left.held && this.shotTime <= 0 && clip.bullets > 0 && !powerupBar.pick(glib.Mouse.position)) {
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
    bankBalance = 0;
    loader = new glib.Loader("img/");
    font = glib.Font.load("Consolas", loader);
    Starfield.load();
    Ship.load();
    Money.load();
    bulletImage = loader.load("blob.png");
    laserImage = loader.load("blob.png");
    loader.addEventHandler("complete", function() {
        game = playfield.addChild(new glib.Drawable().setSize(playfield.width, playfield.height));
        ui = playfield.addChild(new glib.Drawable().setSize(playfield.width, playfield.height));
        starfield = game.addChild(new Starfield(150));
        ship = game.addChild(new Ship());
        game.addChild(new Money(playfield.width / 1.25, playfield.height / 2));
        clip = ui.addChild(new Clip());
        powerupBar = ui.addChild(new PowerUpBar());
        moneyPointer = ui.addChild(new MoneyPointer());
        game.onUpdate = function(time, deltaTime) {
            if (Math.random() > 0.96) {
                game.addChild(new Money(playfield.width / 1.25, Math.random() * playfield.height));
            }
        };
    }, true);
    loader.start();
};
