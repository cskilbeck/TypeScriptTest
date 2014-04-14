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
        this.myZindex = 0;
        this.reorder = false;
        this.transparency = 255;
        this.pivot = { x: 0.5, y: 0.5 };
        this.drawMat = null;
        this.pickMat = null;
        this.parent = null;
        this.closed = false;
        this.modal = false;
        this.drawableListNode = List.Node(this);
        this.children = new List("drawableListNode");
    };

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

        onUpdate: function (deltaTime) {
            return;
        },

        //////////////////////////////////////////////////////////////////////

        onClosed: function () {
            return;
        },

        //////////////////////////////////////////////////////////////////////

        onLoaded: function () {
            return;
        },

        //////////////////////////////////////////////////////////////////////

        loaded: function () {
            var c;
            this.onLoaded();
            for (c = this.children.begin() ; c !== this.children.end() ; c = c.next) {
                c.item.loaded();
            }
        },

        //////////////////////////////////////////////////////////////////////

        update: function (deltaTime) {
            this.doUpdate(deltaTime);
            Mouse.unfreeze();
            Keyboard.unfreeze();
        },

        //////////////////////////////////////////////////////////////////////

        doUpdate: function (deltaTime) {
            var c,
                n,
                r,
                frozen;
            this.children.removeIf(function (c) {
                if (c.closed) {
                    c.onClosed();
                    return true;
                }
                return false;
            });
            for (c = this.children.tailNode(); c !== this.children.end() ; c = c.prev) {
                c.item.doUpdate(deltaTime);
                if (c.item.modal && !frozen) {
                    Mouse.freeze();
                    Keyboard.freeze();
                    frozen = true;
                }
            }
            this.onUpdate(deltaTime);
        },

        //////////////////////////////////////////////////////////////////////

        draw: function (context, matrix) {
            var m,
                d,
                c,
                p;
            if (this.visible) {
                if (this.reorder) {
                    this.children.sort(function (a, b) {
                        return b.myZindex - a.myZindex;
                    });
                    this.reorder = false;
                }
                p = { x: -this.pivot.x * this.width(), y: -this.pivot.y * this.height() };
                m = matrix.multiply(this.drawMatrix());
                d = m.translate(p);
                context.setTransform(d.m[0], d.m[1], d.m[2], d.m[3], d.m[4], d.m[5]);
                context.globalAlpha = this.transparency / 255;
                this.onDraw(context);
                for (c = this.children.begin() ; c !== this.children.end() ; c = c.next) {
                    c.item.draw(context, m);
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
            this.dirty = true;
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
            var m,
                p,
                s;
            if (this.dirty) {
                s = { x: this.scale.x * this.drawScale.x, y: this.scale.y * this.drawScale.y };
                m = Matrix.identity().translate(this.position).rotate(this.rotation);
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

        addSibling: function (c) {
            this.parent.addChild(c);
        },

        //////////////////////////////////////////////////////////////////////

        close: function () {
            this.closed = true;
        }

        //////////////////////////////////////////////////////////////////////

    };

    //////////////////////////////////////////////////////////////////////

    Object.defineProperty(Drawable.prototype, "zIndex", {
        enumerable: true,
        set: function (z) {
            this.myZindex = z;
            this.parent.reorder = true;
        },
        get: function () {
            return this.myZindex;
        }
    });

    //////////////////////////////////////////////////////////////////////

    return Drawable;

}());
