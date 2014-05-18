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
            self.canvas.width = this.width + 1;   // need to take padding into account here
            self.canvas.height = this.height + 1;
            context = self.canvas.getContext("2d");
            oldTransparency = dd.transparency;
            oldDraw = this.drawMatrix().copy();
            oldPick = dd.pickMatrix.copy();
            oldGlobal = dd.globalMatrix.copy();
            dd.matrix = chs.Matrix.identity();
            this.transparency = 255;
            this.onDraw = self.oldOnDraw;
            this.draw(context, chs.Matrix.identity().translate({x: 0.5, y: 0.5}), 255); // need to add padding offset to this matrix
            this.onDraw = this.composite_draw;
            dd.transparency = oldTransparency;
            dd.matrix = oldDraw;
            dd.pickMatrix = oldPick;
            dd.globalMatrix = oldGlobal;
        },

        composite_draw: function (context) {
            if(this.compositeData.canvas === null) {              // or dirty in terms of content, as opposed to transform (ie children sorted, added, removed, dirty etc)
                this.composite_compose();
                // var tl = this.drawableData.globalMatrix.apply({ x: 0, y: 0 });
                // var br = this.drawableData.globalMatrix.apply({ x: this.width, y: this.height });
                // chs.Debug.fillRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y, "white");
            }
            context.drawImage(this.compositeData.canvas, 0, 0); // draw at -extent.left, -extent.top
            return false;   // don't draw the children...
        },

        compose: function () {
            var p = this.parent,
                c = this;
            while(p !== null) {
                if(p.composable) {
                    c = p;
                }
                p = p.parent;
            }
            c.compositeData.canvas = null;
            c.onDraw = c.composite_draw;
        },

        decompose: function () {
            this.onDraw = this.compositeData.oldOnDraw;
        }
    });

} ());