//////////////////////////////////////////////////////////////////////

var Sprite = (function () {
    "use strict";

    var sprite = function (graphic, listNodeName) {
        this.x = 0.0;
        this.y = 0.0;
        this.scaleX = 1.0;
        this.scaleY = 1.0;
        this.rotation = 0.0;
        this.pivotX = 0.5;
        this.pivotY = 0.5;
        this.visible = true;
        this.transparency = 255;
        this.image = graphic;
        this.framesWide = 1;
        this.framesHigh = 1;
        this.frameWidth = 0;
        this.frameHeight = 0;
        this.frame = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.flipX = false;
        this.flipY = false;
        this.zIndex = 0;
        this[listNodeName || 'spriteListNode'] = listNode(this);
    };

    //////////////////////////////////////////////////////////////////////
    // private static

    function getScale(s) {
        return {
            x: s.scaleX * (s.flipX ? -1 : 1),
            y: s.scaleY * (s.flipY ? -1 : 1)
        };
    }

    //////////////////////////////////////////////////////////////////////

    function getFrame(s) {
        return {
            w: s.frameWidth === 0 ? s.width() : s.frameWidth,
            h: s.frameHeight === 0 ? s.height() : s.frameHeight
        };
    }

    //////////////////////////////////////////////////////////////////////

    sprite.prototype = {

        //////////////////////////////////////////////////////////////////////

        loaded: function () {
            return this.image !== null && this.image.complete;
        },

        //////////////////////////////////////////////////////////////////////

        width: function () {
            return this.image.width;
        },

        //////////////////////////////////////////////////////////////////////

        height: function () {
            return this.image.height;
        },

        //////////////////////////////////////////////////////////////////////

        setFrameXY: function (x, y) {
            this.frameX = x * this.frameWidth;
            this.frameY = y * this.frameHeight;
        },

        //////////////////////////////////////////////////////////////////////

        setFrame: function (frame) {
            this.setFrameXY((frame % this.framesWide) >>> 0, (frame / this.framesWide) >>> 0);
        },

        //////////////////////////////////////////////////////////////////////

        draw: function (context) {
            var frame,
                xtweak,
                ytweak,
                scale;
            if (this.loaded() && this.visible) {
                frame = getFrame(this);
                scale = getScale(this);
                context.setTransform(1, 0, 0, 1, 0, 0);
                context.translate(this.x, this.y);
                context.rotate(this.rotation);
                context.scale(scale.x, scale.y);
                context.globalAlpha = this.transparency / 255;
                xtweak = 0;
                ytweak = 0;
                if (this.scaleX > 1) {
                    xtweak = 0.5 - (0.5 / this.scaleX);
                }
                if (this.scaleY > 1) {
                    ytweak = 0.5 - (0.5 / this.scaleY);
                }
                context.drawImage(this.image,
                    this.frameX + xtweak, this.frameY + ytweak,
                    frame.w - xtweak * 2, frame.h - ytweak * 2,
                    -this.pivotX * frame.w, -this.pivotY * frame.h,
                    frame.w, frame.h);
            }
        },

        //////////////////////////////////////////////////////////////////////
        // sigh - emulate context transform

        pick: function (p, border) {
            var b = border || 0,
                points,
                matrix,
                scale,
                frame,
                left,
                right,
                top,
                bottom,
                i;
            if (this.loaded()) {
                scale = getScale(this);
                frame = getFrame(this);
                matrix = new Matrix();
                matrix.translate(this.x, this.y);
                matrix.rotate(this.rotation);
                matrix.scale(scale.x, scale.y);
                left = -this.pivotX * frame.w;
                top = -this.pivotY * frame.h;
                right = left + frame.w;
                bottom = top + frame.h;
                points = [];
                points.length = 4;
                points[0] = { x: left, y: top };
                points[1] = { x: right, y: top };
                points[2] = { x: right, y: bottom };
                points[3] = { x: left, y: bottom };
                matrix.transformArray(points);
                return Util.pointInQuad(points, p, border);
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

    return sprite;

}());

//////////////////////////////////////////////////////////////////////
