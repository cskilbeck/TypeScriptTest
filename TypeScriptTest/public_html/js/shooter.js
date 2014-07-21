/////////////////////////////////////////////////////////////////////

window.onload = function () {
    "use strict";

    var playfield,
        starfield,
        ship,
        moneyPointer,
        clip,
        font,
        loader,
        bulletImage,
        laserImage;

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

    // Clip - bullets in the clip

    var clipSize = 20,              // default clip size
        maxClipSize = 60,          // clip can grow to this
        clipIncrementRate = 500;    // add 1 to the clip every N ms

    var Clip = glib.Class({ inherit$: glib.Drawable,

        $: function() {
            glib.Drawable.call(this);
            this.setPosition(10, 10);
            this.bullets = clipSize;
            this.clipSize = clipSize;
            this.incrementRate = clipIncrementRate;
            this.increment = 0;
        },

        onDraw: function(context) {
            font.renderString(context, glib.Util.pad(this.bullets, 2) + " of " + glib.Util.pad(this.clipSize, 2), 0, 0);
        },

        onUpdate: function(time, deltaTime) {
            this.increment += deltaTime;
            if (this.increment >= this.incrementRate) {
                this.bullets = Math.min(this.clipSize, this.bullets + 1);
                this.increment = 0;
            }
        },

        deplete: function() {
            this.bullets = Math.max(0, this.bullets - 1);
        }
    });

    // Money - floats along waiting to be picked up

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

    // MoneyPointer - shows on the powerup bar what you can buy

    var MoneyPointer = glib.Class({ inherit$: glib.Drawable,

        $: function() {
            glib.Drawable.call(this);
        },

        add: function(money) {

        }

    });

    // PowerUpBar - ways to upgrade the ship
    // [
    //      Speed Up (up to 3x)
    //      Shield (degrades with hits and over time)
    //      Rapid Fire (fire bullets faster)
    //      Big CLip (more bullets in the clip)
    //      Fast Charge (charge the clip faster)
    //      Double Shot (fire two bullets at once)
    //      Laser (goes through N enemies)
    //      Multiple (up to N followers)
    //      Smart Bomb (SmartBomb, damages all enemies)
    // ]

    var powerUps = [
        { name: "Speed Up" },
        { name: "Shield" },
        { name: "Rapid Fire" },
        { name: "Big Clip" },
        { name: "Fast Charge" },
        { name: "Double Shot" },
        { name: "Laser" },
        { name: "Multiple" },
        { name: "Smart Bomb" }
    ];

    var PowerUpBar = glib.Class({ inherit$: glib.Drawable,

        $: function() {

        }
    });

    // Projectile - base for all things the ship can shoot

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

    // Regular Projectile

    var StandardProjectile = glib.Class({ inherit$: Projectile,

        $: function(x, y) {
            Projectile.call(this, x, y, 2000 / 1000, bulletImage, 1);
            this.setScale(1.85, 0.15);
            this.setPivot(0.5, 0.5);
        }
    });

    // Laser Projectile

    var LaserProjectile = glib.Class({ inherit$: Projectile,

        $: function(x, y) {
            Projectile.call(this, x, y, 20, laserImage, 3);
        }
    });

    // ? Many types of Multiple?
    //  Circle the ship
    //  Fan out behind & above/below
    //  Follow ship path

    // Multiple - circles the ship and shoots bullets as well
    // any contact with enemy bullet kills it
    // can't be shielded

    var Multiple = glib.Class({ inherit$: glib.Sprite,

        $: function() {

        }
    });

    // Ship - the player ship
    // arrow keys to move
    // shift to fire
    // ctrl to take powerup

    // follow / circle / fan / cross ?

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
            playfield.addChild(new StandardProjectile(this.x, this.y));
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

    // Enemy - base enemy class

    var Enemy = glib.Class({ inherit$: glib.Sprite,

        $: function(image) {
            glib.Sprite.call(this, image);
        }
    });

    // Wave - a wave of enemies

    var Wave = glib.Class({ inherit$: glib.Drawable,

        $: function(image) {
            // create the enemies as children
            // add 'closed' event handler
        }

    });

    // OnResize - make the document.body fill the browser window

    function onResize() {
        document.body.style.width = window.innerWidth + "px";
        document.body.style.height = window.innerHeight + "px";
    }

    // Main

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
        starfield = playfield.addChild(new Starfield(150));
        ship = playfield.addChild(new Ship());
        clip = playfield.addChild(new Clip());
        // start game...
    });
    loader.start();
};
