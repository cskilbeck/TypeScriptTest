//////////////////////////////////////////////////////////////////////

var Drawable = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Drawable = function () {
        this.position = { x: 0, y: 0 };
        this.rotation = 0;
        this.scale = { x: 1, y: 1 };
        this.drawScale = { x: 1, y: 1 };
        this.dirty = true;
        this.visible = true;
        this.zIndex = 0;
        this.transparency = 255;
        this.pivot = { x: 0.5, y: 0.5 };
        this.drawMat = null;
        this.pickMat = null;
        this.parent = null;
        this.closed = false;
        this.drawableListNode = listNode(this);
        this.children = new LinkedList("drawableListNode");
    };

    //////////////////////////////////////////////////////////////////////

    Drawable.halt = 1;
    Drawable.modal = 2;

    //////////////////////////////////////////////////////////////////////

    Drawable.prototype = {

        //////////////////////////////////////////////////////////////////////
        // override these...

        size: function () {
            return { width: 0, height: 0 };
        },

        //////////////////////////////////////////////////////////////////////

        onDraw: function () {
            return;
        },

        //////////////////////////////////////////////////////////////////////

        onUpdate: function () {
            return;
        },

        //////////////////////////////////////////////////////////////////////

        update: function () {
            var c,
                n,
                r;
            this.onUpdate();
            this.children.removeIf(function (c) {
                if (c.closed) {
                    c.onClosed();
                    return true;
                }
                return false;
            });
            this.children.sort(function (c) {
                return c.zIndex;
            });
            for (c = this.children.begin(); c !== this.children.end() ; c = c.next) {
                r = c.item.update();
                if (r === Drawable.halt) {
                    break;
                } else if (r === Drawable.modal) {
                    Mouse.freeze();
                    Keyboard.freeze();
                }
            }
            Mouse.unfreeze();
            Keyboard.unfreeze();
        },

        //////////////////////////////////////////////////////////////////////

        draw: function (context) {
            this.doDraw(context, Matrix.identity());
        },

        //////////////////////////////////////////////////////////////////////

        doDraw: function (context, matrix) {
            var m,
                c;
            if (this.visible) {
                m = matrix.multiply(this.drawMatrix());
                context.globalAlpha = this.transparency / 255;
                context.setTransform(m.m[0], m.m[1], m.m[2], m.m[3], m.m[4], m.m[5]);
                this.onDraw(context);
                for (c = this.children.begin() ; c !== this.children.end() ; c = c.next) {
                    c.item.doDraw(context, m);
                }
            }
        },
        
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
            this.drawScale.x = horiz ? -1 : 1;
            this.drawScale.y = vert ? -1 : 1;
            this.dirty = true;
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        calculateMatrices: function () {
            var m;
            if (this.dirty) {
                m = Matrix.identity().translate(this.position).rotate(this.rotation);
                this.drawMat = m.scale({
                    x: this.scale.x * this.drawScale.x,
                    y: this.scale.y * this.drawScale.y
                });
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
        },

        //////////////////////////////////////////////////////////////////////

        removeChild: function (c) {
            c.parent = null;
            this.children.remove(c);
        },

        //////////////////////////////////////////////////////////////////////

        addChild: function (c) {
            c.parent = this;
            this.children.add(c);
        },

        //////////////////////////////////////////////////////////////////////

        close: function () {
            this.closed = true;
        }

        //////////////////////////////////////////////////////////////////////

    };

    //////////////////////////////////////////////////////////////////////

    return Drawable;

}());
