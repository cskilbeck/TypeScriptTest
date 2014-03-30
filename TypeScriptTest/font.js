//////////////////////////////////////////////////////////////////////

"use strict"

//////////////////////////////////////////////////////////////////////

var Font = (function () {

    //////////////////////////////////////////////////////////////////////

    var Font = function (fontData, images) {
        this.font = fontData;
        this.images = images;
    };

    //////////////////////////////////////////////////////////////////////

    Font.prototype = {

        drawText: function (ctx, x, y, str) {
            for (var l = 0; l < this.font.layerCount; ++l) {
                var layer = this.font.Layers[l];
                var xc = x + layer.offsetX;
                var yc = y + layer.offsetY;
                for (var i in str) {
                    var c = str.charCodeAt(i);
                    if (this.font.charMap.hasOwnProperty(c)) {
                        var g = this.font.charMap[c];
                        var glyph = this.font.glyphs[g];
                        var s = glyph.images[l];
                        var img = this.images[s.page];
                        ctx.drawImage(img, s.x, s.y, s.w, s.h, xc + s.offsetX, yc + s.offsetY, s.w, s.h);
                        xc += glyph.advance;
                    }
                }
            }
        },

        //////////////////////////////////////////////////////////////////////
        // just measure the top layer...
        // don't handle \n yet

        measureText: function (str) {
            var l = this.font.layerCount - 1;
            var w = 0;
            var h = this.font.height;
            var layer = this.font.Layers[l];
            var xc = layer.offsetX;
            var yc = layer.offsetY;
            for (var i in str) {
                var c = str.charCodeAt(i);
                if (this.font.charMap.hasOwnProperty(c)) {
                    var g = this.font.charMap[c];
                    var glyph = this.font.glyphs[g];
                    var s = glyph.images[l];
                    w = xc + s.w;
                    xc += glyph.advance;
                }
            }
            return { width: w, height: h };
        }
    };

    //////////////////////////////////////////////////////////////////////

    return Font;
})();

//////////////////////////////////////////////////////////////////////

