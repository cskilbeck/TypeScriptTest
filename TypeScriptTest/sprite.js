//////////////////////////////////////////////////////////////////////

var Sprite = (function () {
    "use strict";

    var Sprite = function (name, loader, listNodeName) {
        this.position = { x: 0, y: 0 };
        this.scale = { x: 0, y: 0 };
        this.pivot = { x: 0.5, y: 0.5 };
        this.flip = { horizontal: false, vertical: false };
        this.UV = { x: 0, y: 0 };
        this.rotation = 0.0;
        this.visible = true;
        this.transparency = 255;
        this.framesWide = 1;
        this.framesHigh = 1;
        this.frameWidth = null;
        this.frameHeight = null;
        this.frame = 0;
        this.zIndex = 0;
        this.loaded = false;
        this.dirty = true;
        this.width = 0;
        this.height = 0;
        this.drawMat = new Matrix();
        this.pickMat = new Matrix();
        this[listNodeName || 'spriteListNode'] = listNode(this);
        this.image = loader.loadImage(name, function (img) {
            this.width = img.width;
            this.height = img.height;
            this.frameWidth = this.frameWidth || this.width;
            this.frameHeight = this.frameHeight || this.height;
            this.loaded = true;
        }, this);
        this.image.onload = function (e) {
            this.width = this.image.width;
            this.height = this.image.width;
            this.frameWidth = this.frameWidth || this.width;
            this.frameHeight = this.frameHeight || this.height;
            this.loaded = true;
        }.bind(this);
    };

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

        calculateMatrices: function () {
            var m,
                s = {};
            if (this.dirty) {
                s.x = this.scale.x * (this.flip.horizontal ? -1 : 1);
                s.y = this.scale.y * (this.flip.vertical ? -1 : 1);
                m = new Matrix().translate(this.position).rotate(this.rotation);
                this.drawMat = m.scale(s);
                this.pickMat = m.scale(this.scale);
                this.dirty = false;
            }
        },

        //////////////////////////////////////////////////////////////////////

        drawMatrix: function () {
            this.calculateMatrices();
            return this.drawMat;
        },

        //////////////////////////////////////////////////////////////////////

        pickMatrix: function () {
            this.calculateMatrices();
            return this.pickMat;
        },

        //////////////////////////////////////////////////////////////////////

        draw: function (context) {
            var scale,
                xtweak,
                ytweak,
                m;
            if (this.visible) {
                m = this.drawMatrix().m;
                context.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
                context.globalAlpha = this.transparency / 255;
                xtweak = 0;
                ytweak = 0;
                // correct dodgy bleeding problem
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
                b;
            l = -this.pivot.x * this.frameWidth;
            t = -this.pivot.y * this.frameHeight;
            r = l + this.frameWidth;
            b = t + this.frameHeight;
            return Util.pointInConvexPoly(
                this.pickMatrix().transform([{ x: l, y: t }, { x: r, y: t }, { x: r, y: b }, { x: l, y: b }]),
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
