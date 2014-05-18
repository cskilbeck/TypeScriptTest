(function () {
    "use strict";

    chs.Composite = chs.Class({

        $: function () {
            this.compositeData = {
                canvas: null,
                oldOnDraw: this.onDraw
            };
            this.composable = true;
        },

        composite_compose: function () {
            var context,
                oldTransparency,
                oldDraw,
                oldPick,
                oldGlobal,
                dd = this.drawableData,
                self = this.compositeData;
            self.canvas = document.createElement("canvas");
            self.canvas.width = this.width + dd.padding.left + dd.padding.right + 1;   // need to take padding into account here
            self.canvas.height = this.height + dd.padding.top + dd.padding.bottom + 1;
            context = self.canvas.getContext("2d");
            oldTransparency = dd.transparency;
            oldDraw = this.drawMatrix().copy();
            oldPick = dd.pickMatrix.copy();
            oldGlobal = dd.globalMatrix.copy();
            dd.matrix = chs.Matrix.identity();
            this.transparency = 255;
            this.onDraw = self.oldOnDraw;
            this.draw(context, chs.Matrix.identity().translate({ x: dd.padding.left, y: dd.padding.top }), 255); // need to add padding offset to this matrix
            this.onDraw = this.composite_draw;
            dd.transparency = oldTransparency;
            dd.matrix = oldDraw;
            dd.pickMatrix = oldPick;
            dd.globalMatrix = oldGlobal;
        },

        composite_draw: function (context) {
            var cd = this.compositeData,
                dd = this.drawableData;
            if(cd.canvas === null) {              // or dirty in terms of content, as opposed to transform (ie children sorted, added, removed, dirty etc)
                this.composite_compose();
            }
            context.drawImage(cd.canvas, Math.floor(-dd.padding.left), Math.floor(-dd.padding.top)); // draw at -extent.left, -extent.top
            return false;   // don't draw the children...
        },

        compose: function () {
            var c = this;
            c.compositeData.canvas = null;
            c.onDraw = c.composite_draw;
        },

        decompose: function () {
            this.onDraw = this.compositeData.oldOnDraw;
        }
    });

} ());