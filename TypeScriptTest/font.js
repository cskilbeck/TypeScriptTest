//////////////////////////////////////////////////////////////////////

chs.Font = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Font = function (font, page) {
            this.page = page;
            this.font = font;
            this.lineSpacing = 2;
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

        //////////////////////////////////////////////////////////////////////

        renderString: function (ctx, str, x, y, lineSpace) {
            var l,
                i,
                layer,
                xc,
                yc,
                c,
                s,
                glyph,
                inLink = false,
                escape = false,
                skip = false,
                ls = (lineSpace !== undefined) ? lineSpace : this.lineSpacing;
            for (l = 0; l < this.font.layerCount; ++l) {
                layer = this.font.Layers[l];
                xc = x + layer.offsetX;
                yc = y + layer.offsetY;
                for (i = 0; i < str.length; ++i) {
                    c = str[i];
                    if (!escape) {
                        switch (c) {
                        case '\n':
                            xc = layer.offsetX;
                            yc += this.font.height + ls;
                            skip = true;
                            break;
                        case '\\':
                            escape = true;
                            skip = true;
                            break;
                        case '@':
                            inLink = !inLink;
                            skip = true;
                            break;
                        default:
                            skip = false;
                            break;
                        }
                    }
                    if (!skip) {
                        c = this.font.charMap[c.charCodeAt(0)];
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
            }
        },

        //////////////////////////////////////////////////////////////////////

        drawText: function (ctx, str, position, rotation, scale, horizontalAlign, verticalAlign, lineSpace, links) {
            var d,
                xo = 0,
                yo = 0;
            switch (horizontalAlign) {
            case Font.right:
                xo = -1;
                break;
            case Font.center:
                xo = -0.5;
                break;
            }
            switch (verticalAlign) {
            case Font.bottom:
                yo = -1;
                break;
            case Font.middle:
                yo = -0.5;
                break;
            }
            d = this.measureText(str, lineSpace, links);
            chs.Util.setTransform(ctx, position, rotation, scale);
            this.renderString(ctx, str, d.width * xo, d.height * yo, lineSpace);
        },

        //////////////////////////////////////////////////////////////////////
        // just measure the top layer

        measureText: function (str, lineSpace, links) {
            var l = this.font.layerCount - 1,
                maxWidth = 0,
                w = 0,
                h = this.font.height,
                layer = this.font.Layers[l],
                yc = layer.offsetY + this.font.height,
                xc = layer.offsetX,
                i,
                c,
                glyph,
                s,
                inLink = false,
                escape = false,
                skip = false,
                ls = (lineSpace !== undefined) ? lineSpace : this.lineSpacing;

            if (links !== undefined) {
                links.length = 0;
            }
            for (i = 0; i < str.length; ++i) {
                c = str[i];
                if (!escape) {
                    switch (c) {
                    case '\n':
                        xc = layer.offsetX;
                        yc += this.font.height + ls;
                        skip = true;
                        break;
                    case '\\':
                        escape = true;
                        skip = true;
                        break;
                    case '@':
                        inLink = !inLink;
                        skip = true;
                        if (links !== undefined) {
                            if (inLink) {
                                links.push(xc, yc - this.font.height);
                            } else {
                                links.push(xc, yc);
                            }
                        }
                        break;
                    default:
                        skip = false;
                        break;
                    }
                }
                if (!skip) {
                    c = this.font.charMap[c.charCodeAt(0)];
                    if (c !== undefined) {
                        glyph = this.font.glyphs[c];
                        if (l < glyph.imageCount) {
                            s = glyph.images[l];
                            w = xc + s.w;
                            if (w > maxWidth) {
                                maxWidth = w;
                            }
                        }
                        xc += glyph.advance;
                    }
                }
            }
            return { width: maxWidth, height: yc };
        },

        //////////////////////////////////////////////////////////////////////

        wrapText: function (str, width, lineBreak, lineSpace) {
            var lastGood = 1,
                i,
                newGood,
                newText;
            while (this.measureText(str, lineSpace).width >= width) {
                newGood = -1;
                for (i = lastGood; i < str.length; ++i) {
                    if (str[i] === " ") {
                        newText = str.slice(0, i);
                        if (this.measureText(newText, lineSpace).width >= width) {
                            break;
                        }
                        newGood = i;
                    }
                }
                if (newGood === -1) {
                    break;
                }
                lastGood = newGood;
                if (lastGood >= str.length) {
                    break;
                }
                str = str.slice(0, lastGood) + lineBreak + str.slice(lastGood + 1);
                lastGood += lineBreak.length;
            }
            return str;
        }
    };

    //////////////////////////////////////////////////////////////////////

    Object.defineProperty(Font, "height", {
        enumerable: true,
        get: function () {
            return this.font.height;
        }
    });

    //////////////////////////////////////////////////////////////////////

    return Font;
}());

//////////////////////////////////////////////////////////////////////

