//////////////////////////////////////////////////////////////////////

var Drawable = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Drawable = function () {
        this.position = { x: 0, y: 0 };
        this.rotation = 0;
        this.scale = { x: 1, y: 1 };
        this.flip = { horizontal: false, vertical: false };
        this.dirty = true;
        this.visible = true;
        this.zIndex = 0;
        this.transparency = 255;
        this.pivot = { x: 0.5, y: 0.5 };
        this.drawMat = null;
        this.pickMat = null;
        this.drawableListNode = listNode(this);
    };

    //////////////////////////////////////////////////////////////////////

    Drawable.prototype = {

        //////////////////////////////////////////////////////////////////////

        size: undefined,
        draw: undefined,

        //////////////////////////////////////////////////////////////////////

        width: function () {
            return this.size().width;
        },

        //////////////////////////////////////////////////////////////////////

        height: function () {
            return this.size().height;
        },

        //////////////////////////////////////////////////////////////////////

        setPivot: function (x, y) {
            this.pivot.x = x;
            this.pivot.y = y;
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        setRotation: function (radians) {
            this.rotation = radians;
            this.dirty = true;
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        setPosition: function (x, y) {
            this.position.x = x;
            this.position.y = y;
            this.dirty = true;
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        move: function (x, y) {
            this.position.x += x;
            this.position.y += y;
            this.dirty = true;
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        setScale: function (x, y) {
            this.scale.x = x;
            this.scale.y = y || x;
            this.dirty = true;
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        setFlip: function (horiz, vert) {
            this.flip.horizontal = horiz;
            this.flip.vertical = vert;
            this.dirty = true;
            return this;
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

        setTransform: function (context) {
            var m = this.drawMatrix().m;
            context.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
        },

        //////////////////////////////////////////////////////////////////////

        setupContext: function(context) {
            if (this.visible) {
                this.setTransform(context);
                context.globalAlpha = this.transparency / 255;
            }
            return this.visible;
        },

        //////////////////////////////////////////////////////////////////////

        pickMatrix: function () {
            this.calculateMatrices();
            return this.pickMat;
        },

        //////////////////////////////////////////////////////////////////////

        pick: function (point, border) {
            var w = this.width(),
                h = this.height(),
                l = -this.pivot.x * w,
                t = -this.pivot.y * h,
                r = l + w,
                b = t + h;
            return Util.pointInConvexPoly(
                this.pickMatrix().transform([{ x: l, y: t }, { x: r, y: t }, { x: r, y: b }, { x: l, y: b }]),
                point,
                border
            );
        }
    };

    //////////////////////////////////////////////////////////////////////

    return Drawable;

}());
