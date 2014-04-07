//////////////////////////////////////////////////////////////////////

var Font = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Font = function (name, loader) {
        this.font = null;
        this.images = [];
        this.images.push(loader.loadImage(name + '0')); // ugh - name has to be the same as the file...
        loader.loadJSON(name, function (font) {
            this.font = font;
            // multi-page fonts not supported...
        }, this);
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
                    c = str.charCodeAt(i);
                    if (this.font.charMap.hasOwnProperty(c)) {
                        glyph = this.font.glyphs[this.font.charMap[c]];
                        if (l < glyph.imageCount) {
                            s = glyph.images[l];
                            ctx.drawImage(this.images[s.page], s.x, s.y, s.w, s.h, xc + s.offsetX, yc + s.offsetY, s.w, s.h);
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
                w = 0,
                h = 0,
                layer,
                xc,
                i,
                c,
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
                    glyph = this.font.glyphs[this.font.charMap[c]];
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

