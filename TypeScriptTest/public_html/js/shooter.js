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

    var screenWidth = 1280,
        screenHeight = 720,
        font,
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
        powerupBar;

    var shipMinSpeed = 50,
        shipSpeedIncrement = 20,
        shipMaxSpeed = 90;

    /////////////////////////////////////////////////////////////////////

    var Starfield = glib.Class({ inherit$: glib.Drawable,

        $: function(numStars) {
            var i;
            glib.Drawable.call(this);
            this.numStars = numStars;
            this.width = playfield.width;
            this.height = playfield.height;
            this.random = new glib.Random();
            this.stars = [];
            for (i = 0; i < this.numStars; ++i) {
                this.stars.push({
                    x: this.random.next() % this.width,
                    y: this.random.next() % this.height,
                    period: this.random.nextFloat() * 16 + 16,
                    speed: this.random.nextFloat() * 15 + 20,
                    size: 2.5 + this.random.nextFloat() * 1.75,
                    scale: 1
                });
            }
        },

        onUpdate: function(time, deltaTime) {
            var i,
                star,
                scale;
            for (i = 0; i < this.numStars; ++i) {
                star = this.stars[i];
                star.x -= deltaTime * star.speed;
                star.scale = Math.sin(star.x / this.height * Math.PI * 2 * star.period) * 2 + star.size;
                if (star.x < -star.scale) {
                    star.x = this.width;
                    star.y = this.random.next() % this.height;
                    star.period = this.random.nextFloat() * 16 + 16;
                    star.speed = this.random.nextFloat() * 15 + 20;
                }
            }
        },

        onDraw: function(context) {
            var i,
                star, offset;
            context.fillStyle = "rgb(128, 128, 192)";
            for (i = 0; i < this.numStars; ++i) {
                star = this.stars[i];
                offset = star.scale / 2;
                context.fillRect(star.x - offset, star.y - offset, star.scale, star.scale);
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
                ship.speed = Math.min(shipMaxSpeed, ship.speed + shipSpeedIncrement);
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
            this.drain = this.addChild(new glib.SolidRectangle(1, 1, w - 2, 4, 0, "yellow").setVisible(false));
            this.addChild(new glib.Label(powerUp.name, font)).setPosition(this.width / 2, this.height / 2 + 1).setPivot(0.5, font.midPivot);
            this.baseMoney = baseMoney;
            this.hover = false;
            this.active = false;
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
            var t;
            this.setFillColour();
            if (this.active) {
                t = time - this.activatedTime;
                if (t <= this.powerUp.drainTime) {
                    this.drain.setScale(1 - t / this.powerUp.drainTime, 1);
                } else {
                    this.active = false;
                    this.powerUp.onDrain.call(this.powerUp.context);
                }
            }
            this.drain.setVisible(this.active);
        },

        onMouseEnter: function(e) {
            this.hover = true;
        },

        onMouseLeave: function(e) {
            this.hover = false;
        },

        onLeftMouseDown: function(e) {
            if (bankBalance >= this.baseMoney) {
                this.powerUp.onbuy.call(this.powerUp.context);
                this.active = true;
                this.activatedTime = glib.Timer.time;
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

        static$: {
            image: null,
            load: function() {
                StandardProjectile.image = loader.load("blob.png");
            }
        },

        $: function(x, y) {
            Projectile.call(this, x, y, 2000, StandardProjectile.image, 1);
            this.setScale(1.85, 0.15);
            this.setPivot(0.5, 0.5);
        }
    });

    /////////////////////////////////////////////////////////////////////

    var LaserProjectile = glib.Class({ inherit$: Projectile,

        static$: {
            image: null,
            load: function() {
                LaserProjectile.image = loader.load("blob.png");
            }
        },

        $: function(x, y) {
            Projectile.call(this, x, y, 20, LaserProjectile.image, 3);
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
            this.speed = shipMinSpeed;
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
            glib.Debug.print(this.speed);
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
    // Queue up the actions
    // Actions are complete on some condition (time, proximity to the ship, position, whatever)
    // Each action is a function
    // Action list is circular (if the last one completes, it goes back to the first one)
    // Enemies can fire bullets (towards the ship, or whatever)
    // Enemies are derived from glib.Sprite
    // Would be cool to have an Enemy which has children (gun turrets, say)
    // Enemies can be invulnerable
    // Create a white mask from the image for when it gets hit
    // Some Enemies drop Money (random? velocity?)

    var Enemy = glib.Class({ inherit$: glib.Sprite,

        $: function(image) {
            glib.Sprite.call(this, image);
            this.actions = [];
            this.actionPointer = 0;
            this.stateTime = 0;
            // create a mask
            this.maskImage = glib.Util.createMask(image);
        },

        addAction: function(callback) {
            this.actions.push(callback);
        },

        launch: function(x, y, time) {
            this.setPosition(x, y);
            this.stateTime = time;
            this.actionPointer = 0;
        },

        onUpdate: function(time, deltaTime) {
            if (this.actions[this.actionPointer].call(this, time, deltaTime)) {
                this.actionPointer = ++this.actionPointer % this.actions.length;
                this.stateTime = time;
            }
            if (this.x < -this.width) {
                this.close();
            }
        }
    });

    var grunt = [
        function(time, deltaTime) {
            this.x -= time * 50;
        }
    ];

    var wibbler = [
        function(time, deltaTime) {
            this.x -= deltaTime * 40;
            this.y += Math.sin(this.x / 50) * 40 * deltaTime;
        }
    ];

    // var seeker = []; // and so on

    var wave1 = [
        {
            launch: 5,
            of: grunt,
            at: [screenWidth, screenHeight / 2],
            every: 1
        }
    ];

    /////////////////////////////////////////////////////////////////////
    // A wave is a list of what enemies to launch, where to launch them and a delay

    var Wave = glib.Class({ inherit$: glib.Drawable,

        $: function(actions, image) {
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
        width: screenWidth,
        height: screenHeight,
        backgroundColour: "rgb(8, 8, 64)",
        autoCenter: true,
        DOMContainer: document.body
    });
    bankBalance = 2000;
    loader = new glib.Loader("img/");
    font = glib.Font.load("Consolas", loader);
    Ship.load();
    Money.load();
    StandardProjectile.load();
    LaserProjectile.load();
    loader.addEventHandler("complete", function() {
        game = playfield.addChild(new glib.Drawable().setSize(playfield.width, playfield.height));
        ui = playfield.addChild(new glib.Drawable().setSize(playfield.width, playfield.height));
        starfield = game.addChild(new Starfield(100));
        ship = game.addChild(new Ship());
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
