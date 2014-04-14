//////////////////////////////////////////////////////////////////////

var Drawable = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Drawable = function () {
        this.drawableListNode = List.Node(this);
        this.drawableData = {
            position: { x: 0, y: 0 },
            rotation: 0,
            scale: { x: 1, y: 1 },
            drawScale: { x: 1, y: 1 },
            dirty: true,
            visible: true,
            myZindex: 0,
            reorder: false,
            transparency: 255,
            pivot: { x: 0.5, y: 0.5 },
            drawMat: null,
            pickMat: null,
            parent: null,
            closed: false,
            modal: false,
            children: new List("drawableListNode")
        };
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
            var self = this.drawableData,
                c;
            this.onLoaded();
            for (c = self.children.begin() ; c !== self.children.end() ; c = c.next) {
                c.item.loaded();
            }
        },

        //////////////////////////////////////////////////////////////////////

        update: function (deltaTime) {
            var self = this.drawableData,
                c,
                n,
                r,
                frozen = false;
            self.children.removeIf(function (c) {
                if (c.drawableData.closed) {
                    c.onClosed();
                    return true;
                }
                return false;
            });
            for (c = self.children.tailNode() ; c !== self.children.end() ; c = c.prev) {
                c.item.update(deltaTime);
                if (c.item.drawableData.modal && !frozen) {
                    Mouse.freeze();
                    Keyboard.freeze();
                    frozen = true;
                }
            }
            if (frozen) {
                Mouse.unfreeze();
                Keyboard.unfreeze();
            }
            this.onUpdate(deltaTime);
        },

        //////////////////////////////////////////////////////////////////////

        draw: function (context, matrix) {
            var self = this.drawableData,
                m,
                d,
                c,
                p;
            if (self.visible) {
                if (self.reorder) {
                    self.children.sort(function (a, b) {
                        return b.drawableData.myZindex - a.drawableData.myZindex;
                    });
                    self.reorder = false;
                }
                p = { x: -self.pivot.x * this.width, y: -self.pivot.y * this.height };
                m = matrix.multiply(this.drawMatrix());
                d = m.translate(p);
                context.setTransform(d.m[0], d.m[1], d.m[2], d.m[3], d.m[4], d.m[5]);
                context.globalAlpha = self.transparency / 255;
                this.onDraw(context);
                for (c = self.children.begin() ; c !== self.children.end() ; c = c.next) {
                    c.item.draw(context, m);
                }
            }
        },
        
        //////////////////////////////////////////////////////////////////////

        setPivot: function (x, y) {
            this.drawableData.pivot.x = x;
            this.drawableData.pivot.y = y;
            this.drawableData.dirty = true;
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        setRotation: function (radians) {
            this.drawableData.rotation = radians;
            this.drawableData.dirty = true;
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        setPosition: function (x, y) {
            this.drawableData.position.x = x;
            this.drawableData.position.y = y;
            this.drawableData.dirty = true;
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        move: function (x, y) {
            this.drawableData.position = {
                x: this.drawableData.position.x + x,
                y: this.drawableData.position.y + y
            };
            this.drawableData.dirty = true;
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        setScale: function (x, y) {
            this.drawableData.scale.x = x;
            this.drawableData.scale.y = y || x;
            this.drawableData.dirty = true;
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        setFlip: function (horiz, vert) {
            this.drawableData.drawScale.x = horiz ? -1 : 1;
            this.drawableData.drawScale.y = vert ? -1 : 1;
            this.drawableData.dirty = true;
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        calculateMatrices: function () {
            var self = this.drawableData,
                m,
                p,
                s;
            if (self.dirty) {
                s = { x: self.scale.x * self.drawScale.x, y: self.scale.y * self.drawScale.y };
                m = Matrix.identity().translate(self.position).rotate(self.rotation);
                self.drawMat = m.scale(s);
                self.pickMat = m.scale(self.scale);
                self.dirty = false;
            }
        },

        //////////////////////////////////////////////////////////////////////

        drawMatrix: function () {
            this.calculateMatrices();
            return this.drawableData.drawMat;
        },

        //////////////////////////////////////////////////////////////////////

        pickMatrix: function () {
            this.calculateMatrices();
            return this.drawableData.pickMat;
        },

        //////////////////////////////////////////////////////////////////////

        pick: function (point, border) {
            var self = this.drawableData,
                w = this.width,
                h = this.height,
                l = -self.pivot.x * w,
                t = -self.pivot.y * h,
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
            c.drawableData.parent = null;
            this.drawableData.children.remove(c);
        },

        //////////////////////////////////////////////////////////////////////

        removeChildren: function () {
            var self = this.drawableData;
            while (!self.children.empty()) {
                this.removeChild(self.children.head());
            }
        },

        //////////////////////////////////////////////////////////////////////

        addChild: function (c) {
            c.drawableData.parent = this;
            this.drawableData.children.add(c);
            this.drawableData.reorder = true;
        },

        //////////////////////////////////////////////////////////////////////

        addSibling: function (c) {
            this.drawableData.parent.addChild(c);
        },

        //////////////////////////////////////////////////////////////////////

        close: function () {
            this.drawableData.closed = true;
        }

        //////////////////////////////////////////////////////////////////////

    };

    //////////////////////////////////////////////////////////////////////

    Object.defineProperty(Drawable.prototype, "rotation", {
        get: function () {
            return this.drawableData.rotation;
        },
        set: function (r) {
            this.drawableData.rotation = r;
            this.drawableData.dirty = true;
        }
    });

    //////////////////////////////////////////////////////////////////////

    Object.defineProperty(Drawable.prototype, "x", {
        get: function () {
            return this.drawableData.position.x;
        },
        set: function (x) {
            this.drawableData.position.x = x;
            this.drawableData.dirty = true;
        }
    });

    //////////////////////////////////////////////////////////////////////

    Object.defineProperty(Drawable.prototype, "width", {
        configurable: true,
        get: function () {
            return this.size().width;
        }
    });

    //////////////////////////////////////////////////////////////////////

    Object.defineProperty(Drawable.prototype, "height", {
        configurable: true,
        get: function () {
            return this.size().height;
        }
    });

    //////////////////////////////////////////////////////////////////////

    Object.defineProperty(Drawable.prototype, "y", {
        get: function () {
            return this.drawableData.position.y;
        },
        set: function (y) {
            this.drawableData.position.y = y;
            this.drawableData.dirty = true;
        }
    });

    //////////////////////////////////////////////////////////////////////

    Object.defineProperty(Drawable.prototype, "position", {
        get: function () {
            return this.drawableData.position;
        },
        set: function (s) {
            this.drawableData.position.x = s.x;
            this.drawableData.position.y = s.y;
            this.drawableData.dirty = true;
        }
    });

    //////////////////////////////////////////////////////////////////////

    Object.defineProperty(Drawable.prototype, "scale", {
        get: function () {
            return this.drawableData.scale;
        },
        set: function (s) {
            this.drawableData.scale.x = s.x;
            this.drawableData.scale.y = s.y;
            this.drawableData.dirty = true;
        }
    });

    //////////////////////////////////////////////////////////////////////

    Object.defineProperty(Drawable.prototype, "zIndex", {
        configurable: false,
        enumerable: true,
        set: function (z) {
            var self = this.drawableData;
            self.myZindex = z;
            if (self.parent !== null) {
                self.parent.drawableData.reorder = true;
            }
        },
        get: function () {
            return this.drawableData.myZindex;
        }
    });

    //////////////////////////////////////////////////////////////////////

    Object.defineProperty(Drawable.prototype, "visible", {
        configurable: false,
        enumerable: true,
        set: function (v) {
            this.drawableData.visible = v;
        },
        get: function () {
            return this.drawableData.visible;
        }
    });

    //////////////////////////////////////////////////////////////////////

    Object.defineProperty(Drawable.prototype, "transparency", {
        configurable: false,
        enumerable: true,
        set: function (t) {
            this.drawableData.transparency = t;
        },
        get: function () {
            return this.drawableData.transparency;
        }
    });

    //////////////////////////////////////////////////////////////////////

    Object.defineProperty(Drawable.prototype, "modal", {
        configurable: false,
        enumerable: true,
        set: function (m) {
            this.drawableData.modal = m;
        },
        get: function () {
            return this.drawableData.modal;
        }
    });

    //////////////////////////////////////////////////////////////////////

    return Drawable;

}());
