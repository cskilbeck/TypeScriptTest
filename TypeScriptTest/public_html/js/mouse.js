//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    function relMouseCoords(elem, x, y) {

        var totalOffsetX = 0,
            totalOffsetY = 0,
            currentElement = elem;
        do {
            totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
            totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
            currentElement = currentElement.offsetParent;
        } while (currentElement !== null);
        return { x: x - totalOffsetX, y: y - totalOffsetY };
    }

    //////////////////////////////////////////////////////////////////////

    function fixupMouseEvent(event) {
        var b;
        event = event || window.event;
        return {
            e: event,
            target: event.target || event.srcElement,
            which: event.which,
            x: event.x || event.clientX,
            y: event.y || event.clientY
        };
    }

    //////////////////////////////////////////////////////////////////////

    function addListener(element, name, func) {
        element.addEventListener(name, func, false);
    }

    //////////////////////////////////////////////////////////////////////

    function viewport() {
        var wnd = window,
            innerW = 'innerWidth',
            innerH = 'innerHeight';
        if (!window.hasOwnProperty('innerWidth')) {
            innerW = 'clientWidth';
            innerH = 'clientHeight';
            wnd = document.documentElement || document.body;
        }
        return { width: wnd[innerW], height: wnd[innerH] };
    }

    //////////////////////////////////////////////////////////////////////

    function setMouseCapture(element, canvas, mouse, events) {
        if (element.setCapture) {
            element.setCapture();
        }

        document.oncontextmenu = function (e) {
            e.cancelBubble = true;
            return false;
        };

        addListener(element, "losecapture", function () {
            if (element.setCapture) {
                element.setCapture();
            }
        });

        addListener(element, "touchstart", function (event) {
            var touch = event.targetTouches[0],
                pos = relMouseCoords(canvas, touch.clientX, touch.clientY);
            events.push(new chs.TouchMessage(chs.Message.touchStart, pos));
            event.preventDefault();
            return false;
        });

        addListener(element, "touchmove", function (event) {
            var touch = event.targetTouches[0],
                pos = relMouseCoords(canvas, touch.clientX, touch.clientY);
            events.push(new chs.TouchMessage(chs.Message.touchMove, pos));
            event.preventDefault();
            return false;
        });

        addListener(element, "touchend", function (event) {
            events.push(new chs.TouchMessage(chs.Message.touchEnd, { x: 0, y: 0 }));
            event.preventDefault();
            return false;
        });

        addListener(element, "mousedown", function (event) {
            var p;
            if (element.setCapture) {
                element.setCapture();
            }
            event = fixupMouseEvent(event);
            p = relMouseCoords(canvas, event.x, event.y);
            switch (event.which) {
            case 1:
                mouse.left.held = true;
                events.push(new chs.MouseMessage(chs.Message.leftMouseDown, p));
                break;
            case 3:
                mouse.right.held = true;
                events.push(new chs.MouseMessage(chs.Message.rightMouseDown, p));
                break;
            }
            return false;
        });

        addListener(element, "mouseup", function (event) {
            var p;
            event = fixupMouseEvent(event);
            p = relMouseCoords(canvas, event.x, event.y);
            switch (event.which) {
            case 1:
                mouse.left.held = false;
                events.push(new chs.MouseMessage(chs.Message.leftMouseUp, p));
                break;
            case 3:
                mouse.right.held = false;
                events.push(new chs.MouseMessage(chs.Message.rightMouseUp, p));
                break;
            }
        });

        addListener(element, "mousemove", function (event) {
            var view = viewport(),
                e,
                p;
            event = window.event || event;
            if (event && event.preventDefault) {
                event.preventDefault();
            }
            e = fixupMouseEvent(event);
            p = relMouseCoords(canvas, e.x, e.y);
            mouse.position.x = p.x;
            mouse.position.y = p.y;
            if (e.y < 0 || e.y > view.height || e.x < 0 || e.x > view.width) {
                if (element.releaseCapture) {    // allow IE to see mouse clicks outside client area
                    element.releaseCapture();
                }
            } else {
                if (element.setCapture) {
                    element.setCapture();
                }
            }
            events.push(new chs.MouseMessage(chs.Message.mouseMove, p));
        });
    }

    //////////////////////////////////////////////////////////////////////

    function updateButton(b) {
        var delta = b.held !== b.prev;
        b.pressed = delta && b.held;
        b.released = delta && !b.held;
        b.prev = b.held;
    }

    //////////////////////////////////////////////////////////////////////

    var IMouse = function () {
        this.position = { x: 0, y: 0 };
        this.delta = { x: 0, y: 0 };
        this.left = { held: false, pressed: false, released: false, prev: false };
        this.right = { held: false, pressed: false, released: false, prev: false };
    },

        canvas = null,
        screen = null,
        old = { x: 0, y: 0 },
        frozen = new IMouse(),
        active = new IMouse(),
        cur = active,
        events = [];

    chs.Mouse = chs.Class({

        static$: {

            init: function (canvasElement) {
                canvas = canvasElement;
                screen = document.body;
                setMouseCapture(screen, canvas, active, events);
            },

            update: function (root) {
                var e;
                updateButton(active.left);
                updateButton(active.right);
                active.delta.x = active.position.x - old.x;
                active.delta.y = active.position.y - old.y;
                old.x = active.position.x;
                old.y = active.position.y;

                chs.Debug.print("EVENTS:");
                chs.Debug.print("   There are " + events.length.toString());
                chs.Debug.print("    ...2");

                while (events.length > 0) {
                    e = events.shift();
                    chs.Debug.print("    : ", e.type, e.x, e.y);
                    root.processMessage(e);
                }

            },

            freeze: function () {
                cur = frozen;
            },

            unfreeze: function () {
                cur = active;
            },

            position: chs.Property({
                get: function () {
                    return cur.position;
                }
            }),

            delta: chs.Property({
                get: function () {
                    return cur.delta;
                }
            }),

            left: chs.Property({
                get: function () {
                    return cur.left;
                }
            }),

            right: chs.Property({
                get: function () {
                    return cur.right;
                }
            })
        }
    });

}());
