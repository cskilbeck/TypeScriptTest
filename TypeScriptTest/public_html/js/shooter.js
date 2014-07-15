/////////////////////////////////////////////////////////////////////

window.onload = function () {
    "use strict";

    var playfield,
        loader;

    var Starfield = glib.Class({ inherit$: glib.Drawable,

        $: function(numStars) {
            glib.Drawable.call(this);
            this.numStars = numStars;
            this.enabled = false;
            this.starImage = loader.load("blob.png");
            this.width = playfield.width;
            this.height = playfield.height;
            this.random = new glib.Random();
            this.stars = [];
            loader.addEventHandler("complete", this.loaded, this, true);
        },

        loaded: function() {
            var i,
                star,
                x,y;
            this.enabled = true;
            for (i = 0; i < this.numStars; ++i) {
                x = this.random.next() % this.width;
                y = i * (this.height + this.starImage.height) / this.numStars - this.starImage.height / 2;
                star = new glib.Sprite(this.starImage).setPivot(0.5, 0.5).setPosition(x, y);
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
                star.y = (star.y + deltaTime / star.speed);
                star.setScale(Math.sin(star.y / this.height * Math.PI * 2 * star.period) * 0.05 + 0.1);
                if (star.y - star.height / 2 > this.height) {
                    star.x = this.random.next() % this.width;
                    star.y = -star.height / 2;
                    star.period = this.random.next() % 16 + 16;
                    star.speed = this.random.next() % 15 + 20;
                }
            }
        }
    });

    var Ship = glib.Class({ inherit$: glib.Sprite,

        $: function() {
            glib.Sprite.call(this, loader.load("blob.png"));
            this.setPosition(playfield.width / 2, playfield.height / 2);
            this.setScale(2,2);
            this.setPivot(0.5, 0.5);
            this.speed = 1;
            this.enabled = false;
            loader.addEventHandler("complete", this.loaded, this, true);
        },

        loaded: function() {
            this.enabled = true;
        },

        onUpdate: function(time, deltaTime) {
            var x = 0,
                y = 0,
                v = this.speed * deltaTime / 10;
            if (glib.Keyboard.held("left")) { x -= 4; }
            if (glib.Keyboard.held("right")) { x += 4; }
            if (glib.Keyboard.held("up")) { y -= 3; }
            if (glib.Keyboard.held("down")) { y += 3; }
            if (glib.Keyboard.held("shift")) {
                this.visible = false;
            } else {
                this.visible = true;
            }
            this.x = glib.Util.constrain(this.x + x * v, 0, playfield.width);
            this.y = glib.Util.constrain(this.y + y * v, 0, playfield.height);
        }
    });

    function onResize() {
        document.body.style.width = window.innerWidth + "px";
        document.body.style.height = window.innerHeight + "px";
    }

    (function(e) {
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
        playfield.addChild(new Starfield(150));
        playfield.addChild(new Ship());
        loader.start();
    }());
};
