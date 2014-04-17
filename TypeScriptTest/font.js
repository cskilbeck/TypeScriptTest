//////////////////////////////////////////////////////////////////////

chs.Font = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Font = function (font, page) {
        this.page = page;
        this.font = font;
        this.lineSpacing = 0;
        this.softLineSpacing = 0;
        this.letterSpacing = 0;
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

    return chs.override(Font, {

        midPivot: {
            get: function () {
                return this.font.baseline / this.font.height / 2;
            }
        },

        //////////////////////////////////////////////////////////////////////

        height: {
            get: function () {
                return this.font.height;
            }
        },

        //////////////////////////////////////////////////////////////////////

        baseline: {
            get: function () {
                return this.font.baseline;
            }
        },

        //////////////////////////////////////////////////////////////////////

        renderString: function (ctx, str, x, y) {
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
                ls = this.lineSpacing,
                sls = this.softLineSpacing;
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
                        case '\r':
                            xc = layer.offsetX;
                            yc += this.font.height + sls;
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
        // just measure the top layer

        measureText: function (str, links) {
            var l = this.font.layerCount - 1,
                maxWidth = 0,
                w = 0,
                h = this.font.height,
                layer = this.font.Layers[l],
                yc = layer.offsetY,
                xc = layer.offsetX,
                i,
                c,
                glyph,
                s,
                inLink = false,
                escape = false,
                skip = false,
                link = "",
                sls = this.softLineSpacing,
                ls = this.lineSpacing;

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
                    case '\r':
                        xc = layer.offsetX;
                        yc += this.font.height + sls;
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
                                links.push(xc, yc);
                            } else {
                                links.push(xc, yc + this.font.height, link);
                                link = "";
                            }
                        }
                        break;
                    default:
                        skip = false;
                        break;
                    }
                }
                if (!skip) {
                    if (inLink) {
                        link += c;
                    }
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
            return { width: maxWidth, height: yc + this.font.height };
        },

        //////////////////////////////////////////////////////////////////////

        wrapText: function (str, width, lineBreak) {
            var lastGood = 1,
                i,
                newGood,
                newText;
            while (this.measureText(str).width >= width) {
                newGood = -1;
                for (i = lastGood; i < str.length; ++i) {
                    if (str[i] === " ") {
                        newText = str.slice(0, i);
                        if (this.measureText(newText).width >= width) {
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
    });

}());

//////////////////////////////////////////////////////////////////////

