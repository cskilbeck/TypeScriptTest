//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    chs.Sprite = chs.Class({ inherit$: chs.Drawable,

        $: function (image) {

            chs.Drawable.call(this);
            this.image = image;
            this.UV = { x: 0, y: 0 };
            this.framesWide = 1;
            this.framesHigh = 1;
            this.frameWidth = null;
            this.frameHeight = null;
            this.frame = 0;
        },

        static$: {

            load: function (name, loader) {
                return new chs.Sprite(loader.load(name + ".png"));
            }
        },

        setFrameXY: function (x, y) {
            this.UV.x = x * this.frameWidth;
            this.UV.y = y * this.frameHeight;
        },

        setFrame: function (frame) {
            this.setFrameXY((frame % this.framesWide) >>> 0, (frame / this.framesWide) >>> 0);
        },

        width: chs.Property({
            get: function () {
                return this.frameWidth || this.image.width;
            }
        }),

        height: chs.Property({
            get: function () {
                return this.frameHeight || this.image.height;
            }
        }),

        size: chs.Property({
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

