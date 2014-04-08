//////////////////////////////////////////////////////////////////////

var Font = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Font = function (font, page) {
        this.page = page;
        this.font = font;
    };

    //////////////////////////////////////////////////////////////////////

    Font.prototype = {

        drawText: function (ctx, x, y, str) {
            var l,
                layer,
                i,
                c,
                xc,
                yc,
                glyph,
                s;
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

