﻿//////////////////////////////////////////////////////////////////////

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

        //////////////////////////////////////////////////////////////////////

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

        //////////////////////////////////////////////////////////////////////
        // set the transform before you call this

        // \#
        // \@
        // \X = X
        // #command:param(s)#
        // eg:
        //      #position:35,50# - move cursor to 35,50
        // @link@ - return array of bounding rectangles of the links

        scanString: function(ctx, str, charCallback, commandCallback) {

            var scan = 0,
                hash = 1,
                command = 2,
                params = 3,
                at = 4,
                escape = 5,

                state,
                i,
                c,
                l,
                layer,
                s,
                glyph,
                inEscape,
                escaped,
                o = {
                    context: ctx,
                    xc:0,
                    yc:0,
                },
                linkX,
                linkY,
                link,
                links,
                command,
                param;
            for (l = 0; l < this.font.layerCount; ++l) {
                layer = this.font.Layers[l];
                o.xc = layer.offsetX;
                o.yc = layer.offsetY;

                for (i = 0; i < str.length; ++i) {

                    c = str[i];

                    if (inEscape) {
                        escaped = true;
                        inEscape = false;
                    } else {
                        if (c == '\\') {
                            inEscape = true;
                            escaped = false;
                        }
                    }

                    switch (state) {

                        case scan:
                            if (!escaped) {
                                if (c === '@') {
                                    link = "";
                                    linkX = o.xc;
                                    linkY = o.yc;
                                    state = at;
                                    break;
                                }
                                if (c === '#') {
                                    command = "";
                                    param = "";
                                    state = hash;
                                    break;
                                }
                                if (c === '\n') {
                                    o.xc = 0;
                                    o.yc += this.font.height;
                                }
                            }
                            break;

                        case at:
                            if (c === '@' && !escaped) {
                                links.push({ x: linkX, y: linkY, str: link });
                                state = scan;
                            } else {
                                link += c;
                            }
                            break;

                        case hash:
                            if (c === ':' && !escaped) {
                                state = params;
                            } else if (c === '#' && !escaped) {
                                commandCallback.call(this, o, command, param);
                                state = scan;
                            } else {
                                command += c;
                            }
                            break;

                        case params:
                            if (c === '#' && !escaped) {
                                commandCallback.call(this, o, command, param);
                                state = scan;
                            } else {
                                param += c;
                            }
                            break;
                    }
                    xc += this.drawChar(ctx, c, l, xc, yc);
                }
            }
        },

        //////////////////////////////////////////////////////////////////////

        drawChar: function (ctx, ch, layer, xc, yc) {
            var c = this.font.charMap[c.charCodeAt(0)],
                glyph,
                s;
            if (c !== undefined) {
                glyph = this.font.glyphs[ch];
                if (layer < glyph.imageCount) {
                    s = glyph.images[layer];
                    ctx.drawImage(this.page, s.x, s.y, s.w, s.h, xc + s.offsetX, yc + s.offsetY, s.w, s.h);
                }
                return glyph.advance;
            }
            return 0;
        },

        //////////////////////////////////////////////////////////////////////

        drawText: function (ctx, str, position, rotation, scale, horizontalAlign, verticalAlign) {
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
            d = this.measureText(str);
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

