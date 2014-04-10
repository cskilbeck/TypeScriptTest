//////////////////////////////////////////////////////////////////////

var Font = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Font = function (font, page) {
        this.page = page;
        this.font = font;
    };

    //////////////////////////////////////////////////////////////////////

    Font.load = function (name, loader) {
        return new Font(loader.load(name + ".json"), loader.load(name + "0.png"));
    };

    //////////////////////////////////////////////////////////////////////
    // alignment options

    Font.left = 0;
    Font.right = 1;
    Font.center = 2;

    Font.top = 3;
    Font.bottom = 4;
    Font.middle = 5;
    Font.baseline = 6;

    //////////////////////////////////////////////////////////////////////

    Font.prototype = {

        renderString: function (ctx, str, x, y) {
            var l,
                i,
                layer,
                xc,
                yc,
                c,
                s,
                glyph;
            for (l = 0; l < this.font.layerCount; ++l) {
                layer = this.font.Layers[l];
                xc = x + layer.offsetX;
                yc = y + layer.offsetY;
                for (i = 0; i < str.length; ++i) {
                    c = this.font.charMap[str.charCodeAt(i)];
                    if (c !== undefined) {
                        glyph = this.font.glyphs[c];
                        if (l < glyph.imageCount) {
                            s = glyph.images[l];
                            ctx.drawImage(this.page, s.x, s.y, s.w, s.h, xc + s.offsetX, yc + s.offsetY, s.w, s.h);
                        }
                        xc += glyph.advance;
                    }
                }
            }
        },

        drawText: function (ctx, str, position, rotation, scale, horizontalAlign, verticalAlign) {
            var l,
                layer,
                i,
                c,
                xc,
                yc,
                glyph,
                s,
                measureIt = false,
                p,
                d = { width: 0, height: 0 },
                xo = 0,
                yo = 0;
            switch (horizontalAlign) {
            case Font.right:
                measureIt = true;
                xo = -1;
                break;
            case Font.center:
                measureIt = true;
                xo = -0.5;
                break;
            }
            switch (verticalAlign) {
            case Font.bottom:
                measureIt = true;
                yo = -1;
                break;
            case Font.middle:
                measureIt = true;
                yo = -0.5;
                break;
            }
            if (measureIt) {
                d = this.measureText(str);
            }
            Util.setTransform(ctx, position, rotation, scale);
            this.renderString(ctx, str, d.width * xo, d.height * yo);
        },

        //////////////////////////////////////////////////////////////////////
        // just measure the top layer, don't handle \n yet

        measureText: function (str) {
            var l = this.font.layerCount - 1,
                w = 0,
                h = this.font.height,
                layer = this.font.Layers[l],
                xc = layer.offsetX,
                i,
                c,
                glyph,
                s;
            for (i = 0; i < str.length; ++i) {
                c = this.font.charMap[str.charCodeAt(i)];
                if (c !== undefined) {
                    glyph = this.font.glyphs[c];
                    if (l < glyph.imageCount) {
                        s = glyph.images[l];
                        w = xc + s.w;
                    }
                    xc += glyph.advance;
                }
            }
            return { width: w, height: h };
        }
    };

    //////////////////////////////////////////////////////////////////////

    return Font;
}());

//////////////////////////////////////////////////////////////////////

