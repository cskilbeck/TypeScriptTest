(function () {
    "use strict";

    // can't deal with size changing yet...

    glib.Composite = glib.Class({

        static$: {
            identityMatrix: new glib.Matrix()
        },

        $: function () {
            this.compositeData = {
                canvas: null,
                dirty: false,
                oldOnDraw: this.onDraw,
                oldDraw: new glib.Matrix(),
                oldPick: new glib.Matrix(),
                oldGlobal: new glib.Matrix(),
                oldTransparency: 0
            };
            this.composable = true;
        },

        composite_compose: function () {
            var context,
                w,
                h,
                dd = this.drawableData,
                self = this.compositeData;
            w = this.width + dd.padding.left + dd.padding.right + 1;
            h = this.height + dd.padding.top + dd.padding.bottom + 1;
            if(self.canvas === null || w > self.canvas.width || h > self.canvas.height) {
                if(self.canvas !== null) {
                    self.canvas.destroy();
                }
                self.canvas = glib.Canvas.create(w, h);
            } else {
                // console.log("Canvas size didn't change...");
                self.canvas.clear();
            }
            this.oldTransparency = dd.transparency;
            this.drawMatrix().copyTo(self.oldDraw);
            dd.pickMatrix.copyTo(self.oldPick);
            dd.globalMatrix.copyTo(self.oldGlobal);
            dd.matrix.setIdentity();
            this.transparency = 255;
            this.onDraw = self.oldOnDraw;
            glib.Composite.identityMatrix.translation = { x: dd.padding.left, y: dd.padding.top };
            this.draw(self.canvas.context, glib.Composite.identityMatrix, 255);
            this.onDraw = this.composite_draw;
            dd.transparency = this.oldTransparency;
            this.drawMatrix().copyFrom(self.oldDraw);
            dd.pickMatrix.copyFrom(self.oldPick);
            dd.globalMatrix.copyFrom(self.oldGlobal);
            self.dirty = false;
        },

        composite_draw: function (context) {
            var cd = this.compositeData,
                dd = this.drawableData;
            if(cd.dirty) {
                this.composite_compose();
            }
            context.drawImage(cd.canvas.canvas, -dd.padding.left, -dd.padding.top); // draw at -extent.left, -extent.top
            return false;   // don't draw the children...
        },

        compose: function () {
            var cd = this.compositeData;
            cd.dirty = true;
            if(this.composable) {
                this.onDraw = this.composite_draw;
            }
        },

        decompose: function () {
            this.onDraw = this.compositeData.oldOnDraw;
        }
    });

} ());