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
        this.dirty = true;
        this.m = new Matrix();
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

    function setTransform(context, m) {
        context.setTransform(m.m[0], m.m[1], m.m[2], m.m[3], m.m[4], m.m[5]);
    }

    //////////////////////////////////////////////////////////////////////

    Sprite.prototype = {

        //////////////////////////////////////////////////////////////////////

        setPosition: function (x, y) {
            this.position.x = x;
            this.position.y = y;
            this.dirty = true;
        },

        //////////////////////////////////////////////////////////////////////

        setScale: function (x, y) {
            this.scale.x = x;
            this.scale.y = y || x;
            this.dirty = true;
        },

        //////////////////////////////////////////////////////////////////////

        setPivot: function (x, y) {
            this.pivot.x = x;
            this.pivot.y = y;
            this.dirty = true;
        },

        //////////////////////////////////////////////////////////////////////

        setFlip: function (horiz, vert) {
            this.flip.horizontal = horiz;
            this.flip.vertical = vert;
            this.dirty = true;
        },

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

        setRotation: function (radians) {
            this.rotation = radians;
            this.dirty = true;
        },

        //////////////////////////////////////////////////////////////////////

        setupMatrix: function () {
            if (this.dirty) {
                this.m.setIdentity().translate(this.position).rotate(this.rotation).scale(this.scale);
                this.dirty = false;
            }
        },

        //////////////////////////////////////////////////////////////////////

        draw: function (context) {
            var scale,
                xtweak,
                ytweak;
            if (this.visible) {
                this.setupMatrix();
                scale = getScale(this);
                setTransform(context, this.m);
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

        pick: function (point, border) {
            var l,
                r,
                t,
                b,
                m;
            l = -this.pivot.x * this.frameWidth;
            t = -this.pivot.y * this.frameHeight;
            r = l + this.frameWidth;
            b = t + this.frameHeight;
            this.setupMatrix();
            return Util.pointInConvexPoly(
                this.m.transform([{ x: l, y: t }, { x: r, y: t }, { x: r, y: b }, { x: l, y: b }]),
                point,
                border
            );
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
