﻿//////////////////////////////////////////////////////////////////////

chs.Drawable = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Drawable = function () {
        this.drawableListNode = chs.List.Node(this);
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
            pivot: { x: 0, y: 0 },
            matrix: chs.Matrix.identity(),
            pickMatrix: chs.Matrix.identity(),
            parent: null,
            closed: false,
            modal: false,
            children: new chs.List("drawableListNode")
        };
    };

    //////////////////////////////////////////////////////////////////////

    Drawable.prototype = {

        //////////////////////////////////////////////////////////////////////
        // override these...

        size: function () {
            return this.dimensions || { width: 0, height: 0 };
        },

        //////////////////////////////////////////////////////////////////////

        onDraw: function (context) {
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
                    chs.Mouse.freeze();
                    chs.Keyboard.freeze();
                    frozen = true;
                }
            }
            this.onUpdate(deltaTime);   // modal children freeze their parent
            if (frozen) {
                chs.Mouse.unfreeze();
                chs.Keyboard.unfreeze();
            }
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
                m = matrix.multiply(this.drawMatrix());
                self.pickMatrix = m;
                context.save();
                context.setTransform(m.m[0], m.m[1], m.m[2], m.m[3], m.m[4], m.m[5]);
                context.globalAlpha = self.transparency / 255;
                this.onDraw(context);
                for (c = self.children.begin() ; c !== self.children.end() ; c = c.next) {
                    c.item.draw(context, m);
                }
                context.restore();
            }
        },
        
        //////////////////////////////////////////////////////////////////////

        debug: function () {
            var self = this.drawableData,
                c;
            chs.Debug.text(self.matrix.m[4], self.matrix.m[5], self.dirty);
            for (c = self.children.begin() ; c !== self.children.end() ; c = c.next) {
                c.item.debug();
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

        refreshMatrix: function () {
            var self = this.drawableData,
                p,
                s;
            p = { x: -self.pivot.x * this.width, y: -self.pivot.y * this.height };
            s = { x: self.scale.x * self.drawScale.x, y: self.scale.y * self.drawScale.y };
            self.matrix = chs.Matrix.identity().translate(self.position).rotate(self.rotation).scale(s).translate(p);
            self.dirty = false;
        },

        //////////////////////////////////////////////////////////////////////

        drawMatrix: function () {
            var self = this.drawableData;
            if (self.dirty) {
                this.refreshMatrix();
            }
            return self.matrix;
        },

        //////////////////////////////////////////////////////////////////////

        pick: function (point, border) {
            var w = this.width,
                h = this.height;
            return chs.Util.pointInConvexPoly(
                this.drawableData.pickMatrix.transform([{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }]),
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
            var self = this.drawableData;
            c.drawableData.parent = this;
            self.children.add(c);
            self.reorder = true;
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
