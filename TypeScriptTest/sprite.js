//////////////////////////////////////////////////////////////////////

var Sprite = (function () {
    "use strict";

    var Sprite = function (graphic, listNodeName) {
        this.position = { x: 0, y: 0 };
        this.scale = { x: 0, y: 0 };
        this.pivot = { x: 0.5, y: 0.5 };
        this.flip = { horizontal: false, vertical: false };
        this.UV = { x: 0, y: 0 };
        this.rotation = 0.0;
        this.visible = true;
        this.transparency = 255;
        this.image = graphic;
        this.framesWide = 1;
        this.framesHigh = 1;
        this.frameWidth = null;
        this.frameHeight = null;
        this.frame = 0;
        this.zIndex = 0;
        this.loaded = false;
        this[listNodeName || 'spriteListNode'] = listNode(this);

        graphic.addEventListener("load", function () {
            this.width = graphic.width;
            this.height = graphic.height;
            this.frameWidth = this.frameWidth || this.width;
            this.frameHeight = this.frameHeight || this.height;
            this.loaded = true;
        }.bind(this), false);

        if (graphic.complete) {
            this.width = graphic.width;
            this.height = graphic.height;
            this.frameWidth = this.width;
            this.frameHeight = this.height;
            this.loaded = true;
        }
    };

    //////////////////////////////////////////////////////////////////////
    // private static

    function getScale(s) {
        return {
            x: s.scale.x * (s.flip.horizontal ? -1 : 1),
            y: s.scale.y * (s.flip.vertical ? -1 : 1)
        };
    }

    //////////////////////////////////////////////////////////////////////

    Sprite.prototype = {

        //////////////////////////////////////////////////////////////////////

        setFrameXY: function (x, y) {
            this.UV.x = x * this.frameWidth;
            this.UV.y = y * this.frameHeight;
        },

        //////////////////////////////////////////////////////////////////////

        setFrame: function (frame) {
            this.setFrameXY((frame % this.framesWide) >>> 0, (frame / this.framesWide) >>> 0);
        },

        //////////////////////////////////////////////////////////////////////

        setScale: function (x, y) {
            this.scale.x = x;
            this.scale.y = y || x;
        },

        //////////////////////////////////////////////////////////////////////

        draw: function (context) {
            var scale,
                xtweak,
                ytweak;
            if (this.loaded && this.visible) {
                scale = getScale(this);
                context.setTransform(1, 0, 0, 1, 0, 0);
                context.translate(this.position.x, this.position.y);
                context.rotate(this.rotation);
                context.scale(scale.x, scale.y);
                context.globalAlpha = this.transparency / 255;
                xtweak = 0;
                ytweak = 0;
                if (this.scale.x > 1) {
                    xtweak = 0.5 - (0.5 / this.scale.x);
                }
                if (this.scale.y > 1) {
                    ytweak = 0.5 - (0.5 / this.scale.y);
                }
                context.drawImage(this.image,
                    this.UV.x + xtweak, this.UV.y + ytweak,
                    this.frameWidth - xtweak * 2, this.frameHeight - ytweak * 2,
                    -this.pivot.x * this.frameWidth, -this.pivot.y * this.frameWidth,
                    this.frameWidth, this.frameWidth);
            }
        },

        //////////////////////////////////////////////////////////////////////

        pick: function (p, border) {
            var left,
                right,
                top,
                bottom;
            if (this.loaded && this.visible) {
                left = -this.pivot.x * this.frameWidth;
                top = -this.pivot.y * this.frameHeight;
                right = left + this.frameWidth;
                bottom = top + this.frameHeight;
                return Util.pointInConvexPoly(
                    new Matrix().
                        translate(this.position).
                        rotate(this.rotation).
                        scale(this.scale).
                        transform([
                            { x: left, y: top },
                            { x: right, y: top },
                            { x: right, y: bottom },
                            { x: left, y: bottom }
                        ]),
                    p,
                    border
                );
            }
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        drawSafe: function (context) {
            context.save();
            this.draw(context);
            context.restore();
        }
    };

    //////////////////////////////////////////////////////////////////////

    return Sprite;

}());

//////////////////////////////////////////////////////////////////////
