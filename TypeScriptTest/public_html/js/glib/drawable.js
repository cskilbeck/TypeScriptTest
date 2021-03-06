//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    glib.Drawable = glib.Class({ inherit$: glib.EventSource,

        static$: {
            updateId: 0,
            drawId: 0
        },

        $: function () {
            glib.EventSource.call(this);
            this.drawableData = {
                position: { x: 0, y: 0 },
                dimensions: { width: 0, height: 0 },
                padding: { left: 0, top: 0, right: 0, bottom: 0},    // how much (or -ive) padding required on the sides
                rotation: 0,
                scale: { x: 1, y: 1 },
                drawScale: { x: 1, y: 1 },
                dirty: true,
                visible: true,
                myZindex: 0,
                baseZindex: 0,
                reorder: false,
                transparency: 255,
                pivot: { x: 0, y: 0 },
                mouseIsOver: false,
                matrix: new glib.Matrix(),
                pickMatrix: new glib.Matrix(),
                globalMatrix: new glib.Matrix(),
                mouseCapture: false,
                touchCapture: false,
                parent: null,
                enabled: true,
                closed: false,
                modal: false,
                children: []
            };
        },

        //////////////////////////////////////////////////////////////////////
        // override these...

        onKeyDown: function(keyEvent) {

        },

        //////////////////////////////////////////////////////////////////////

        onKeyUp: function(keyEvent) {

        },

        //////////////////////////////////////////////////////////////////////

        onMouseEnter: function (e) {
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        onTouchEnter: function (e) {
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        onTouchLeave: function (e) {
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        onTouchStart: function (e) {
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        onTouchEnd: function (e) {
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        onTouchMove: function (e) {
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

        processMessage: function (e, mouseCapture, touchCapture) {
            var self = this.drawableData,
                c,
                i,
                l,
                pick = false,
                tl,
                br,
                colour;
            // kids get first dibs, and are processed front to back
            if (this.enabled) {
                mouseCapture = mouseCapture || self.mouseCapture;
                touchCapture = touchCapture || self.touchCapture;
                for (i = self.children.length - 1; i >= 0; --i) {
                    c = self.children[i];
                    if (c.processMessage(e, mouseCapture, touchCapture) || c.modal) {
                        return true;
                    }
                }
                if (this.visible && this.enabled) {

                    // tl = self.globalMatrix.apply({ x: 0, y: 0 });
                    // br = self.globalMatrix.apply({ x: this.width, y: this.height });
                    if (e.position !== undefined) {
                        pick = this.pick(e.position, 0);                           // message over the drawable?
                        // if (pick) {
                        //     var color = "black";
                        //     if (Math.random() > 0.333) {
                        //         color = "red";
                        //     } else if(Math.random() > 0.666) {
                        //         color = "white";
                        //     }
                        //     glib.Debug.line(tl.x, tl.y, br.x, tl.y, color);
                        //     glib.Debug.line(tl.x, br.y, br.x, br.y, color);
                        //     glib.Debug.line(tl.x, tl.y, tl.x, br.y, color);
                        //     glib.Debug.line(br.x, tl.y, br.x, br.y, color);
                        // }
                    }

                    switch (e.type) {

                    case glib.Message.touchStart:
                        if(pick || self.touchCapture) {
                            self.isTouched = true;
                            this.dispatchEvent('touchStart', e);
                            return this.onTouchStart(e);
                        }
                        break;

                    case glib.Message.touchEnd:
                        this.dispatchEvent('touchEnd');
                        self.isTouched = false;
                        return this.onTouchEnd(e) && false;

                    case glib.Message.leftMouseDown:
                        if(pick || self.mouseCapture) {
                            this.dispatchEvent('leftMouseDown', e);
                            return this.onLeftMouseDown(e);
                        }
                        break;

                    case glib.Message.rightMouseDown:
                        if(pick || self.mouseCapture) {
                            this.dispatchEvent('rightMouseDown', e);
                            return this.onRightMouseDown(e);
                        }
                        break;

                    case glib.Message.leftMouseUp:
                        if(pick || self.mouseCapture) {
                            this.dispatchEvent('leftMouseUp', e);
                            return this.onLeftMouseUp(e);
                        }
                        break;

                    case glib.Message.rightMouseUp:
                        if(pick || self.mouseCapture) {
                            this.dispatchEvent('rightMouseUp', e);
                            return this.onRightMouseUp(e);
                        }
                        break;

                    case glib.Message.mouseMove:
                        if(pick || self.mouseCapture) {
                            if(!self.mouseIsOver && pick) {
                                // glib.Debug.poly([tl, {x: br.x, y: tl.y}, br, {x: tl.x, y: br.y}], "magenta");
                                this.onMouseEnter(e);
                                this.dispatchEvent('mouseEnter', e);
                            }
                            this.dispatchEvent('mouseMove', e);
                            self.mouseIsOver = pick;
                            return this.onMouseMove(e);
                        } else if(self.mouseIsOver && !pick) {
                            this.dispatchEvent('mouseLeave', e);
                            // glib.Debug.poly([tl, {x: br.x, y: tl.y}, br, {x: tl.x, y: br.y}], "cyan");
                            self.mouseIsOver = false;
                            return this.onMouseLeave(e);
                        }
                        break;

                    case glib.Message.touchMove:
                        if(pick || self.touchCapture) {
                            if(!self.isTouched && pick) {
                                this.dispatchEvent('touchEnter', e);
                            }
                            self.isTouched = true;
                            this.dispatchEvent('touchMove', e);
                            return this.onTouchMove(e);
                        } else if(self.isTouched && !pick) {
                            self.isTouched = false;
                            this.dispatchEvent('touchLeave', e);
                            return this.onTouchLeave(e);
                        }
                        break;

                    case glib.Message.keyDown:
                        this.dispatchEvent('keyDown', e);
                        this.onKeyDown(e);
                        break;

                    case glib.Message.keyUp:
                        this.dispatchEvent('keyUp', e);
                        this.onKeyUp(e);
                        break;
                    }
                }
            }
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        loaded: function (loader) {
            var self = this.drawableData,
                c,
                i,
                l;
            this.dispatchEvent('loaded');
            this.onLoaded(loader);
            for (i = 0, l = self.children.length; i < l; ++i) {
                c = self.children[i];
                c.loaded(loader);
            }
        },

        //////////////////////////////////////////////////////////////////////

        update: function (time, deltaTime, frame, indent) {
            var self = this.drawableData,
                c,
                i,
                l,
                n,
                r,
                frozen = false;
            for (i = 0; i < self.children.length; ++i) {
                c = self.children[i];
                if (c.drawableData.closed) {
                    c.dispatchEvent('closed');
                    c.onClosed();
                    c.drawableData.closed = false;
                    self.children.splice(i, 1);
                }
            }
            if (self.enabled) {
                for (i = self.children.length - 1; i >= 0; --i) {
                    c = self.children[i];
                    c.update(time, deltaTime, frame, indent + 4);
                    if (c.drawableData.modal && !frozen) {
                        glib.Mouse.freeze();
                        glib.Keyboard.freeze();
                        frozen = true;
                    }
                }
                if (self.enabled) {                 // children might disable their parent
                    this.onUpdate(time, deltaTime);
                    //glib.Debug.text(this.x, this.y, glib.Drawable.updateId.toString());
                    glib.Drawable.updateId += 1;
                }
            }
            if (frozen) {
                glib.Mouse.unfreeze();
                glib.Keyboard.unfreeze();
            }
        },

        //////////////////////////////////////////////////////////////////////

        draw: function (context, matrix, transparency) {
            var self = this.drawableData,
                c,
                i,
                l,
                tr;
            if (self.visible) {
                if (self.reorder) {
                    for (i = 0, l = self.children.length; i < l; ++i) {
                        self.children[i].drawableData.baseZindex = i;
                    }
                    self.children.sort(function (a, b) {
                        var d = a.drawableData.myZindex - b.drawableData.myZindex;
                        if (d !== 0) {
                            return d;
                        }
                        return a.drawableData.baseZindex - b.drawableData.baseZindex;
                    });
                    self.reorder = false;
                }
                matrix.multiplyInto(this.drawMatrix(), self.globalMatrix);
                self.globalMatrix.invert(self.pickMatrix);
                self.globalMatrix.setContextTransform(context);
                tr = (transparency * self.transparency) / 255;
                context.globalAlpha = tr / 255;
                context.save();
                if(this.onDraw(context) !== false) {
                    for (i = 0, l = self.children.length; i < l; ++i) {
                        self.children[i].draw(context, self.globalMatrix, tr);
                    }
                }
                context.restore();
            }
        },

        //////////////////////////////////////////////////////////////////////

        debug: function () {
            var self = this.drawableData,
                c,
                i,
                l;
            glib.Debug.text(self.matrix.m[4], self.matrix.m[5], self.dirty);
            for (i = 0, l = self.children.length; i < l; ++i) {
                c = self.children[i];
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

        setSize: function (w, h) {
            this.drawableData.dimensions.width = w;
            this.drawableData.dimensions.height = h;
            this.drawableData.dirty = true;
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        move: function (x, y) {
            this.drawableData.position.x += x;
            this.drawableData.position.y += y;
            this.drawableData.dirty = true;
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        setVisible: function (v) {
            this.drawableData.visible = v;
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        setScale: function (x, y) {
            this.drawableData.scale.x = x;
            this.drawableData.scale.y = (y !== undefined) ? y : x;
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
            self.matrix.setIdentity().translate(self.position).rotate(self.rotation).scale(s).translate(p);
            self.dirty = false;
        },

        //////////////////////////////////////////////////////////////////////

        setCapture: function (f) {
            this.drawableData.mouseCapture = f;
            this.drawableData.touchCapture = f;
            return this;
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
            var i = this.drawableData.children.indexOf(c);
            if (i !== -1) {
                c.drawableData.parent = null;
                this.drawableData.children.splice(i, 1);
            }
        },

        //////////////////////////////////////////////////////////////////////

        removeChildren: function () {
            var self = this.drawableData,
                child;
            while (self.children.length > 0) {
                child = self.children.shift();
                child.drawableData.parent = null;
            }
        },

        //////////////////////////////////////////////////////////////////////

        addChild: function (c) {
            var self = this.drawableData;
            c.drawableData.parent = this;
            self.children.push(c);
            self.reorder = true;
            return c;
        },

        //////////////////////////////////////////////////////////////////////

        addChildToFront: function (c) {
            var self = this.drawableData;
            c.drawableData.parent = this;
            self.children.unshift(c);
            self.reorder = true;
            return c;
        },

        //////////////////////////////////////////////////////////////////////

        addSibling: function (c) {
            this.drawableData.parent.addChild(c);
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        close: function () {
            this.dispatchEvent("closing");
            this.drawableData.closed = true;
            return this;
        },

        //////////////////////////////////////////////////////////////////////
        // check if this overlaps another (only rectangles supported)

        overlaps: function(other) {
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        getScreenExtent: function () {
            var i,
                min,
                max,
                e = this.drawableData.extent,
                points = [
                        { x: e.left, y: e.top },
                        { x: e.right, y: e.top },
                        { x: e.right, y: e.bottom },
                        { x: e.left, y: e.bottom }
                    ];
            this.drawableData.globalMatrix.transform(points);
            min = { x: points[0].x, y: points[0].y };
            max = { x: points[0].x, y: points[0].y };
            for (i = 1; i < 4; ++i) {
                min.x = Math.min(min.x, points[i].x);
                min.y = Math.min(min.y, points[i].y);
                max.x = Math.max(max.x, points[i].x);
                max.y = Math.max(max.y, points[i].y);
            }
            return { left: min.x, top: min.y, right: max.x, bottom: max.y };
        },

        //////////////////////////////////////////////////////////////////////

        rotation: glib.Property({
            get: function () {
                return this.drawableData.rotation;
            },
            set: function (r) {
                this.drawableData.rotation = r;
                this.drawableData.dirty = true;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        position: glib.Property({
            get: function () {
                return this.drawableData.position;
            },
            set: function (s) {
                this.drawableData.position.x = s.x;
                this.drawableData.position.y = s.y;
                this.drawableData.dirty = true;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        x: glib.Property({
            get: function () {
                return this.drawableData.position.x;
            },
            set: function (x) {
                this.drawableData.position.x = x;
                this.drawableData.dirty = true;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        y: glib.Property({
            get: function () {
                return this.drawableData.position.y;
            },
            set: function (y) {
                this.drawableData.position.y = y;
                this.drawableData.dirty = true;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        size: glib.Property({
            get: function () {
                return this.drawableData.dimensions;
            },
            set: function (s) {
                this.drawableData.dimensions.width = s.width;
                this.drawableData.dimensions.height = s.height;
                this.drawableData.dirty = true;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        width: glib.Property({
            configurable: true,
            get: function () {
                return this.drawableData.dimensions.width;
            },
            set: function (w) {
                this.drawableData.dimensions.width = w;
                this.drawableData.dirty = true;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        height: glib.Property({
            configurable: true,
            get: function () {
                return this.drawableData.dimensions.height;
            },
            set: function (h) {
                this.drawableData.dimensions.height = h;
                this.drawableData.dirty = true;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        scale: glib.Property({
            get: function () {
                return this.drawableData.scale;
            },
            set: function (s) {
                this.drawableData.scale.x = s.x;
                this.drawableData.scale.y = s.y;
                this.drawableData.dirty = true;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        zIndex: glib.Property({
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
        }),

        //////////////////////////////////////////////////////////////////////

        parent: glib.Property({
            get: function () {
                return this.drawableData.parent;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        enabled: glib.Property({
            get: function () {
                return this.drawableData.enabled;
            },
            set: function (e) {
                this.drawableData.enabled = e;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        visible: glib.Property({
            set: function (v) {
                this.drawableData.visible = v;
            },
            get: function () {
                return this.drawableData.visible;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        transparency: glib.Property({
            set: function (t) {
                this.drawableData.transparency = t;
            },
            get: function () {
                return this.drawableData.transparency;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        modal: glib.Property({
            set: function (m) {
                this.drawableData.modal = m;
            },
            get: function () {
                return this.drawableData.modal;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        root: glib.Property({
            get: function() {
                var parent = this.drawableData.parent;
                while(parent !== null && parent.drawableData.parent !== null) {
                    parent = parent.drawableData.parent;
                }
                return parent;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        setDirty: function () {
            this.drawableData.dirty = true;
        }

    });

}());
