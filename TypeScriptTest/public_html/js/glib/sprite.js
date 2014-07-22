//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    glib.Sprite = glib.Class({ inherit$: glib.Drawable,

        $: function (image) {

            glib.Drawable.call(this);
            this.image = image;
            this.UV = { x: 0, y: 0 };
            this.framesWide = 1;
            this.framesHigh = 1;
            this.frameWidth = null;
            this.frameHeight = null;
            this.currentFrame = 0;
            this.frame = 0;
        },

        static$: {

            load: function (name, loader) {
                return new glib.Sprite(loader.load(name + ".png"));
            }
        },

        setFrameXY: function (x, y) {
            this.UV.x = x * this.frameWidth;
            this.UV.y = y * this.frameHeight;
        },

        setFrame: function (frame) {
            this.currentFrame = frame;
            this.setFrameXY((frame % this.framesWide) >>> 0, (frame / this.framesWide) >>> 0);
        },

        frame: glib.Property({
            get: function () {
                return this.currentFrame;
            },
            set: function (f) {
                this.setFrame(f);
            }
        }),

        width: glib.Property({
            get: function () {
                return this.frameWidth || this.image.width;
            }
        }),

        height: glib.Property({
            get: function () {
                return this.frameHeight || this.image.height;
            }
        }),

        size: glib.Property({
            get: function () {
                return { width: this.width, height: this.height };
            }
        }),

        scaleTo: function (x, y) {
            this.setScale(x / this.width, y / this.height);
            return this;
        },

        onDraw: function (context, matrix) {
            var w = this.width,
                h = this.height;
            context.drawImage(this.image, this.UV.x, this.UV.y, w, h, 0, 0, w, h);
        }
    });

}());

