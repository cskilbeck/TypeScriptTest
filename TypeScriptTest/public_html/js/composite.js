(function () {
    "use strict";

    chs.Composite = chs.Class({

        $: function () {
            this.compositeData = {
                canvas: null,
                oldOnDraw: this.onDraw
            };
        },

        composite_compose: function () {
            var context;
            this.compositeData.canvas = document.createElement("canvas");
            context = canvas.getContext("2d");
            this.compositeData.canvas.width = this.width;   // need to take padding into account here
            this.compositeData.canvas.height = this.height;
            this.onDraw = this.compositeData.oldOnDraw;
            this.draw(context, chs.Matrix.identity(), 255); // need to add padding offset to this matrix
            this.onDraw = this.composite_draw;
        },

        composite_draw: function (context) {
            if(!this.compositeData.canvas) {              // or dirty in terms of content, as opposed to transform (ie children sorted, )
                this.composite_compose();
            }
            context.drawImage(this.compositeData.canvas, 0, 0);
        }
    });

} ());