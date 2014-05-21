(function () {
    "use strict";

    // can't deal with size changing yet...

    chs.Composite = chs.Class({

        $: function () {
            this.compositeData = {
                canvas: null,
                dirty: false,
                oldOnDraw: this.onDraw
            };
            this.composable = true;
        },

        composite_compose: function () {
            var context,
                w,
                h,
                oldTransparency,
                oldDraw,
                oldPick,
                oldGlobal,
                dd = this.drawableData,
                self = this.compositeData;
            w = this.width + dd.padding.left + dd.padding.right + 1;
            h = this.height + dd.padding.top + dd.padding.bottom + 1;
            if(self.canvas === null || w > self.canvas.width || h > self.canvas.height) {
                if(self.canvas !== null) {
                    self.canvas.destroy();
                }
                self.canvas = chs.Canvas.create(w, h);
            } else {
                // console.log("Canvas size didn't change...");
                self.canvas.clear();
            }
            oldTransparency = dd.transparency;
            oldDraw = this.drawMatrix().copy();
            oldPick = dd.pickMatrix.copy();
            oldGlobal = dd.globalMatrix.copy();
            dd.matrix = chs.Matrix.identity();
            this.transparency = 255;
            this.onDraw = self.oldOnDraw;
            this.draw(self.canvas.context, chs.Matrix.identity().translate({ x: dd.padding.left - 0.5, y: dd.padding.top - 0.5 }), 255);
            this.onDraw = this.composite_draw;
            dd.transparency = oldTransparency;
            dd.matrix = oldDraw;
            dd.pickMatrix = oldPick;
            dd.globalMatrix = oldGlobal;
            self.dirty = false;
        },

        composite_draw: function (context) {
            var cd = this.compositeData,
                dd = this.drawableData;
            if(cd.dirty) {
                this.composite_compose();
            }
            context.drawImage(cd.canvas.canvas, Math.floor(-dd.padding.left), Math.floor(-dd.padding.top)); // draw at -extent.left, -extent.top
            return false;   // don't draw the children...
        },

        compose: function () {
            var cd = this.compositeData;
            cd.dirty = true;
            this.onDraw = this.composite_draw;
        },

        decompose: function () {
            this.onDraw = this.compositeData.oldOnDraw;
        }
    });

} ());