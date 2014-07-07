//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    glib.Image = glib.Class({ inherit$: glib.Drawable,

        $: function (url) {
            var that = this;
            glib.Drawable.call(this);
            this.loaded = false;
            this.image = new Image();
            this.image.onload = function () {
                that.size = { width: that.image.width, height: that.image.height };
                that.loaded = true;
                that.dispatchEvent("loaded");
                that.onDraw = that.realOnDraw;
            };
            if(url) {
                this.image.src = url;
            }
        },

        scaleTo: function (x, y) {
            this.setScale(x / this.width, y / this.height);
            return this;
        },

        src: glib.Property({
            set: function (s) {
                this.image.src = s;
            }
        }),

        onDraw: function (context) {
        },

        realOnDraw: function (context) {
            var w = this.width,
                h = this.height;
            context.drawImage(this.image, 0, 0, w, h, 0, 0, w, h);
        }
    });

}());