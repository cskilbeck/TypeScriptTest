//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    chs.Font = chs.Class({

        //////////////////////////////////////////////////////////////////////

        static$: {

            load: function (name, loader) {
                return new chs.Font(loader.load(name + ".json"), loader.load(name + "0.png"));
            }
        },

        //////////////////////////////////////////////////////////////////////

        $: function (font, page) {
            this.page = page;
            this.font = font;
            this.lineSpacing = 0;
            this.softLineSpacing = 0;
            this.letterSpacing = 0;
            this.mask = 0xff;
        },

        //////////////////////////////////////////////////////////////////////

        midPivot: chs.Property ({
            get: function () {
                return this.font.baseline / this.font.height / 2;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        baselinePivot: chs.Property ({
            get: function () {
                return this.font.baseline / this.font.height;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        height: chs.Property({
            get: function () {
                return this.font.height;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        baseline: chs.Property({
            get: function () {
                return this.font.baseline;
            }
        }),

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
                if ((1 << l) & this.mask) {
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
                                    ctx.drawImage(this.page, s.x, s.y, s.w, s.h, xc + s.offsetX + 0.5, yc + s.offsetY + 0.5, s.w, s.h);
                                }
                                xc += glyph.advance;
                            }
                        }
                    }
                }
            }
        },

        //////////////////////////////////////////////////////////////////////
        // just measure the top layer

        measureText: function (str, links, whichLayer) {
            var layerToMeasure = (whichLayer === undefined) ? this.font.layerCount - 1 : whichLayer,
                l,
                layer,
                maxWidth = 0,
                w = 0,
                xc,
                yc,
                i,
                c,
                glyph,
                s,
                inLink = false,
                escape = false,
                skip = false,
                link = "",
                left = 0,
                right = 0,
                top = 0,
                bottom = 0,
                sls = this.softLineSpacing,
                ls = this.lineSpacing;

            if (links) {
                links.length = 0;
            }
            for (l = 0; l < this.font.layerCount; ++l) {
                layer = this.font.Layers[l];
                xc = layer.offsetX;
                yc = layer.offsetY;
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
                            if (links && l === 0) {
                                if (inLink) {
                                    links.push(xc, yc);
                                } else {
                                    links.push(xc, yc + this.font.baseline + 3, link);
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
                                left = Math.min(s.offsetX + xc, left);
                                right = Math.max(s.offsetX + s.w + xc, right);
                                top = Math.min(s.offsetY + yc, top);
                                bottom = Math.max(s.offsetY + s.h + yc, bottom);
                            }
                            xc += glyph.advance;
                            if (l === layerToMeasure) {
                                maxWidth = Math.max(xc, maxWidth);
                            }
                        }
                    }
                }
            }
            return { width: maxWidth, height: yc + this.font.height, left: left, right: right, top: top, bottom: bottom };
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

