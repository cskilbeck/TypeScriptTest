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
            var context,
                oldPos,
                oldScale,
                oldRot,
                oldTransparency,
                oldPivot;
            this.compositeData.canvas = document.createElement("canvas");
            this.compositeData.canvas.width = this.width;   // need to take padding into account here
            this.compositeData.canvas.height = this.height;
            context = this.compositeData.canvas.getContext("2d");
            oldPos = chs.Util.clone(this.drawableData.position);
            oldScale = chs.Util.clone(this.drawableData.scale);
            oldPivot = chs.Util.clone(this.drawableData.pivot);
            oldRot = this.drawableData.rotation;
            oldTransparency = this.drawableData.transparency;
            this.rotation = 0;
            this.setPosition(0, 0);
            this.setScale(1);
            this.transparency = 255;
            this.setPivot(0, 0);
            this.onDraw = this.compositeData.oldOnDraw;
            this.draw(context, chs.Matrix.identity(), 255); // need to add padding offset to this matrix
            this.onDraw = this.composite_draw;
            this.drawableData.position = oldPos;
            this.drawableData.scale = oldScale;
            this.drawableData.rotation = oldRot;
            this.drawableData.transparency = oldTransparency;
            this.drawableData.pivot = oldPivot;
            this.refreshMatrix();
        },

        composite_draw: function (context) {
            var p;
            if(this.compositeData.canvas === null) {              // or dirty in terms of content, as opposed to transform (ie children sorted, added, removed, dirty etc)
                this.composite_compose();
            }
            context.drawImage(this.compositeData.canvas, 0, 0);
            // p = this.drawableData.globalMatrix.apply({ x: 0, y: 0 });
            // chs.Debug.text(p.x, p.y, "*");
            return false;   // don't draw the children...
        },

        compose: function () {
            this.compositeData.canvas = null;
            this.onDraw = this.composite_draw;
        },

        decompose: function () {
            this.onDraw = this.compositeData.oldOnDraw;
        }
    });

} ());