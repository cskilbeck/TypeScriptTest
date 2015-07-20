//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    glib.Map = glib.Class({ inherit$: glib.Drawable,

        $: function(width, height, blockwidth, blockheight, image) {
            this.map = [];
            this.image = image;
            this.blockwidth = blockwidth;
            this.blockheight = blockheight;
            this.width = width;
            this.height = height;
        },

        getBlock: function(x, y) {
            return this.map[x + y * this.width];
        },

        setBlock: function(x, y, block) {
            this.map[x + y * this.width] = block;
        },

        onDraw: function(context, matrix) {
            var p = glib.Playfield.Root,
                pw = p.Width,
                ph = p.Height;
        }

    });

}());
