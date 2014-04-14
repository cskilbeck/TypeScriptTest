//////////////////////////////////////////////////////////////////////

var Sprite = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Sprite = function (image) {
        Drawable.call(this);
        this.image = image;
        this.UV = { x: 0, y: 0 };
        this.framesWide = 1;
        this.framesHigh = 1;
        this.frameWidth = null;
        this.frameHeight = null;
        this.frame = 0;
    };

    //////////////////////////////////////////////////////////////////////

    Sprite.load = function (name, loader) {
        return new Sprite(loader.load(name + ".png"));
    };

    //////////////////////////////////////////////////////////////////////

    Sprite.prototype = {

        //////////////////////////////////////////////////////////////////////

        setFrameXY: function (x, y) {
            this.UV.x = x * this.frameWidth;
            this.UV.y = y * this.frameHeight;
        },

        //////////////////////////////////////////////////////////////////////

        setFrame: function (frame) {
            this.setFrameXY((frame % this.framesWide) >>> 0, (frame / this.framesWide) >>> 0);
        },

        //////////////////////////////////////////////////////////////////////

        size: function () {
            return {
                width: this.frameWidth || this.image.width,
                height: this.frameHeight || this.image.height
            };
        },

        //////////////////////////////////////////////////////////////////////

        onDraw: function (context, matrix) {
            var xt = (this.scale.x > 1) ? 0.5 - (0.5 / this.scale.x) : 0,
                yt = (this.scale.y > 1) ? 0.5 - (0.5 / this.scale.y) : 0,
                w = this.width(),
                h = this.height();
            context.drawImage(this.image,
                this.UV.x + xt,
                this.UV.y + yt,
                w - xt * 2,
                h - yt * 2,
                0,
                0,
                w,
                h);
        }
    };

    return Sprite.extend(Drawable);

}());

//////////////////////////////////////////////////////////////////////
