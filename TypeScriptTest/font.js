//////////////////////////////////////////////////////////////////////

var Font = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Font = function (name) {
        var i;
        this.font = null;
        this.images = [];
        ajax.get('img/' + name + '.json', {}, function (data) {
            this.font = JSON.parse(data);
            for (i = 0; i < this.font.pageCount; ++i) {
                this.images.push(ImageLoader.load(this.font.name + i.toString()));
            }
        }, this);
    };

    //////////////////////////////////////////////////////////////////////

    Font.prototype = {

        isLoaded: function () {
            var i;
            if (this.font === null) {
                return false;
            }
            for (i = 0; i < this.font.imageCount; ++i) {
                if (!this.images[i].complete) {
                    return false;
                }
            }
            return true;
        },

        drawText: function (ctx, x, y, str) {
            var l,
                layer,
                i,
                c,
                xc,
                yc,
                glyph,
                s;
            if (this.isLoaded()) {
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
            if (this.isLoaded()) {
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
            }
            return { width: w, height: h };
        }
    };

    //////////////////////////////////////////////////////////////////////

    return Font;
}());

//////////////////////////////////////////////////////////////////////

