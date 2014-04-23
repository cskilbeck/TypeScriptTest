//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    chs.Drawable = chs.Class({
        inherit$: [chs.EventSource],

        $: function () {
            chs.EventSource.call(this);
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
                mouseIsOver: false,
                matrix: chs.Matrix.identity(),
                pickMatrix: chs.Matrix.identity(),
                globalMatrix: chs.Matrix.identity(),
                mouseCapture: false,
                parent: null,
                enabled: true,
                closed: false,
                modal: false,
                children: new chs.List("drawableListNode")
            };
        },

        //////////////////////////////////////////////////////////////////////
        // override these...

        size: function () {
            return this.dimensions || { width: 0, height: 0 };
        },

        //////////////////////////////////////////////////////////////////////

        onMouseEnter: function (e) {
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        onMouseLeave: function (e) {
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        onLeftMouseDown: function (e) {
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        onLeftMouseUp: function (e) {
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        onRightMouseDown: function (e) {
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        onRightMouseUp: function (e) {
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        onMouseMove: function (e) {
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        onDraw: function (context) {
            return;
        },

        //////////////////////////////////////////////////////////////////////

        onUpdate: function (time, deltaTime) {
            return;
        },

        //////////////////////////////////////////////////////////////////////

        onClosed: function () {
            return;
        },

        //////////////////////////////////////////////////////////////////////

        onLoaded: function (loader) {
            return;
        },

        //////////////////////////////////////////////////////////////////////

        processMessage: function (e, capture) {
            var self = this.drawableData,
                c,
                p,
                mp,
                bp;
            // kids get first dibs
            if (this.enabled) {
                capture = capture || self.mouseCapture;
                for (c = self.children.tailNode() ; c !== self.children.end() ; c = c.prev) {
                    if (c.item.processMessage(e, capture) || c.item.modal) {
                        return true;
                    }
                }
                if (this.visible) {
                    p = this.pick(e.position, 0);
                    mp = self.mouseCapture || p;
                    if (mp) {
                        switch (e.type) {
                        case chs.Message.leftMouseDown:
                            this.dispatchEvent('leftMouseDown');
                            return this.onLeftMouseDown(e);
                        case chs.Message.rightMouseDown:
                            this.dispatchEvent('rightMouseDown');
                            return this.onRightMouseDown(e);
                        case chs.Message.leftMouseUp:
                            this.dispatchEvent('leftMouseUp');
                            return this.onLeftMouseUp(e);
                        case chs.Message.rightMouseUp:
                            this.dispatchEvent('rightMouseUp');
                            return this.onRightMouseUp(e);
                        }
                        if (!self.mouseIsOver) {
                            self.mouseIsOver = true;
                            this.onMouseEnter(e);
                            this.dispatchEvent('mouseEnter', e);
                        }
                    } else if (!p && self.mouseIsOver) {
                        this.onMouseLeave(e);
                        self.mouseIsOver = false;
                        this.dispatchEvent('mouseLeave', e);
                    }
                    if (mp && e.type === chs.Message.mouseMove) {
                        this.dispatchEvent('mouseMove', e);
                        return this.onMouseMove(e);
                    }
                }
            }
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        loaded: function (loader) {
            var self = this.drawableData,
                c;
            this.dispatchEvent('loaded');
            this.onLoaded(loader);
            for (c = self.children.begin() ; c !== self.children.end() ; c = c.next) {
                c.item.loaded(loader);
            }
        },

        //////////////////////////////////////////////////////////////////////

        update: function (time, deltaTime) {
            var self = this.drawableData,
                c,
                n,
                r,
                frozen = false;
            self.children.removeIf(function (c) {
                if (c.drawableData.closed) {
                    c.dispatchEvent('closed');
                    c.onClosed();
                    c.drawableData.closed = false;
                    return true;
                }
                return false;
            });
            if (self.enabled) {
                for (c = self.children.tailNode() ; c !== self.children.end() ; c = c.prev) {
                    c.item.update(time, deltaTime);
                    if (c.item.drawableData.modal && !frozen) {
                        chs.Mouse.freeze();
                        chs.Keyboard.freeze();
                        frozen = true;
                    }
                }
                this.onUpdate(time, deltaTime);   // modal children freeze their parent
            }
            if (frozen) {
                chs.Mouse.unfreeze();
                chs.Keyboard.unfreeze();
            }
        },

        //////////////////////////////////////////////////////////////////////

        draw: function (context, matrix) {
            var self = this.drawableData,
                m,
                t,
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
                self.globalMatrix = matrix.multiply(this.drawMatrix());
                self.pickMatrix = self.globalMatrix.inverse();
                context.save();
                self.globalMatrix.setContextTransform(context);
                context.globalAlpha = self.transparency / 255;
                this.onDraw(context);
                for (c = self.children.begin() ; c !== self.children.end() ; c = c.next) {
                    c.item.draw(context, self.globalMatrix);
                }
                context.restore();
            }
        },

        //////////////////////////////////////////////////////////////////////

        debug: function () {
            var self = this.drawableData,
                c;
            chs.Debug.text(self.matrix.m[6], self.matrix.m[7], self.dirty);
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

        setCapture: function (f) {
            this.drawableData.mouseCapture = f;
        },

        //////////////////////////////////////////////////////////////////////
        // not sure this handles rotation with non-zero pivot...

        screenToClient: function (p) {
            var self = this.drawableData;
            return self.pickMatrix.apply(p);
        },

        //////////////////////////////////////////////////////////////////////

        clientToScreen: function (p) {
            var self = this.drawableData;
            return self.globalMatrix.apply(p);
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

        pick: function (point) {
            var p = this.screenToClient(point);
            return p.x >= 0 && p.y >= 0 && p.x < this.width && p.y < this.height;
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
            this.dispatchEvent("closing");
            this.drawableData.closed = true;
        },

        //////////////////////////////////////////////////////////////////////

        rotation: {
            get: function () {
                return this.drawableData.rotation;
            },
            set: function (r) {
                this.drawableData.rotation = r;
                this.drawableData.dirty = true;
            }
        },

        //////////////////////////////////////////////////////////////////////

        x: {
            get: function () {
                return this.drawableData.position.x;
            },
            set: function (x) {
                this.drawableData.position.x = x;
                this.drawableData.dirty = true;
            }
        },

        //////////////////////////////////////////////////////////////////////

        y: {
            get: function () {
                return this.drawableData.position.y;
            },
            set: function (y) {
                this.drawableData.position.y = y;
                this.drawableData.dirty = true;
            }
        },

        //////////////////////////////////////////////////////////////////////

        width: {
            configurable: true,
            get: function () {
                return this.size().width;
            }
        },

        //////////////////////////////////////////////////////////////////////

        height: {
            configurable: true,
            get: function () {
                return this.size().height;
            }
        },

        //////////////////////////////////////////////////////////////////////

        position: {
            get: function () {
                return this.drawableData.position;
            },
            set: function (s) {
                this.drawableData.position.x = s.x;
                this.drawableData.position.y = s.y;
                this.drawableData.dirty = true;
            }
        },

        //////////////////////////////////////////////////////////////////////

        scale: {
            get: function () {
                return this.drawableData.scale;
            },
            set: function (s) {
                this.drawableData.scale.x = s.x;
                this.drawableData.scale.y = s.y;
                this.drawableData.dirty = true;
            }
        },

        //////////////////////////////////////////////////////////////////////

        zIndex: {
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
        },

        //////////////////////////////////////////////////////////////////////

        parent: {
            configurable: false,
            enumerable: true,
            get: function () {
                return this.drawableData.parent;
            }
        },

        //////////////////////////////////////////////////////////////////////

        enabled: {
            configurable: false,
            enumerable: true,
            get: function () {
                return this.drawableData.enabled;
            },
            set: function (e) {
                this.drawableData.enabled = e;
            }
        },

        //////////////////////////////////////////////////////////////////////

        visible: {
            configurable: false,
            enumerable: true,
            set: function (v) {
                this.drawableData.visible = v;
            },
            get: function () {
                return this.drawableData.visible;
            }
        },

        //////////////////////////////////////////////////////////////////////

        transparency: {
            configurable: false,
            enumerable: true,
            set: function (t) {
                this.drawableData.transparency = t;
            },
            get: function () {
                return this.drawableData.transparency;
            }
        },

        //////////////////////////////////////////////////////////////////////

        modal: {
            configurable: false,
            enumerable: true,
            set: function (m) {
                this.drawableData.modal = m;
            },
            get: function () {
                return this.drawableData.modal;
            }
        },

        //////////////////////////////////////////////////////////////////////

        setDirty: function () {
            this.drawableData.dirty = true;
        }

    });

}());
