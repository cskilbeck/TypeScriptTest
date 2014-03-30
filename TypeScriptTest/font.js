//////////////////////////////////////////////////////////////////////

/*global ImageLoader */
/*jslint plusplus: true */

//////////////////////////////////////////////////////////////////////

var Font = (function () {

    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Font = function (fontData) {
        var i;
        this.font = fontData;
        this.images = [];
        for (i = 0; i < fontData.pageCount; ++i) {
            this.images.push(ImageLoader.load(fontData.name + i.toString()));
        }
    };

    //////////////////////////////////////////////////////////////////////

    Font.prototype = {

        drawText: function (ctx, x, y, str) {
            var l,
                layer,
                i,
                c,
                g,
                xc,
                yc,
                glyph,
                s,
                img;
            for (l = 0; l < this.font.layerCount; ++l) {
                layer = this.font.Layers[l];
                xc = x + layer.offsetX;
                yc = y + layer.offsetY;
                for (i = 0; i < str.length; ++i) {
                    c = str.charCodeAt(i);
                    if (this.font.charMap.hasOwnProperty(c)) {
                        g = this.font.charMap[c];
                        glyph = this.font.glyphs[g];
                        if (l < glyph.imageCount) {
                            s = glyph.images[l];
                            img = this.images[s.page];
                            ctx.drawImage(img, s.x, s.y, s.w, s.h, xc + s.offsetX, yc + s.offsetY, s.w, s.h);
                        }
                        xc += glyph.advance;
                    }
                }
            }
        },

        //////////////////////////////////////////////////////////////////////
        // just measure the top layer...
        // don't handle \n yet

        measureText: function (str) {
            var l,
                w,
                h,
                layer,
                xc,
                i,
                c,
                g,
                glyph,
                s;
            l = this.font.layerCount - 1;
            w = 0;
            h = this.font.height;
            layer = this.font.Layers[l];
            xc = layer.offsetX;
            for (i = 0; i < str.length; ++i) {
                c = str.charCodeAt(i);
                if (this.font.charMap.hasOwnProperty(c)) {
                    g = this.font.charMap[c];
                    glyph = this.font.glyphs[g];
                    s = glyph.images[l];
                    w = xc + s.w;
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

