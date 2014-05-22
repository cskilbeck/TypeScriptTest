(function () {
    "use strict";

    // can't deal with size changing yet...

    chs.Composite = chs.Class({

        static$: {
            identityMatrix: new chs.Matrix()
        },

        $: function () {
            this.compositeData = {
                canvas: null,
                dirty: false,
                oldOnDraw: this.onDraw,
                oldDraw: new chs.Matrix(),
                oldPick: new chs.Matrix(),
                oldGlobal: new chs.Matrix(),
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
                self.canvas = chs.Canvas.create(w, h);
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
            chs.Composite.identityMatrix.translation = { x: dd.padding.left, y: dd.padding.top };
            this.draw(self.canvas.context, chs.Composite.identityMatrix, 255);
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
            context.drawImage(cd.canvas.canvas, Math.floor(-dd.padding.left), Math.floor(-dd.padding.top)); // draw at -extent.left, -extent.top
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