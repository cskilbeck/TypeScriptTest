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

/*      document.oncontextmenu = function (e) {
            e.cancelBubble = true;
            return false;
        };
*/
        element.addEventListener("losecapture", function () {
            if (element.setCapture) {
                element.setCapture();
            }
        });

        element.addEventListener("touchstart", function (event) {
            var touch = event.targetTouches[0],
                pos = relMouseCoords(canvas, touch.clientX, touch.clientY);
            events.push(new glib.TouchMessage(glib.Message.touchStart, pos));
            event.preventDefault();
            return false;
        });

        element.addEventListener("touchmove", function (event) {
            var touch = event.targetTouches[0],
                pos = relMouseCoords(canvas, touch.clientX, touch.clientY);
            events.push(new glib.TouchMessage(glib.Message.touchMove, pos));
            event.preventDefault();
            return false;
        });

        element.addEventListener("touchend", function (event) {
            events.push(new glib.TouchMessage(glib.Message.touchEnd, { x: 0, y: 0 }, true));
            event.preventDefault();
            return false;
        });

        element.addEventListener("mousedown", function (event) {
            var p;
            if (element.setCapture) {
                element.setCapture();
            }
            event = fixupMouseEvent(event);
            p = relMouseCoords(canvas, event.x, event.y);
            switch (event.which) {
            case 1:
                mouse.left.held = true;
                events.push(new glib.MouseMessage(glib.Message.leftMouseDown, p));
                break;
            case 3:
                mouse.right.held = true;
                events.push(new glib.MouseMessage(glib.Message.rightMouseDown, p));
                break;
            }
            return false;
        });

        element.addEventListener("mouseup", function (event) {
            var p;
            event = fixupMouseEvent(event);
            p = relMouseCoords(canvas, event.x, event.y);
            switch (event.which) {
            case 1:
                mouse.left.held = false;
                events.push(new glib.MouseMessage(glib.Message.leftMouseUp, p));
                break;
            case 3:
                mouse.right.held = false;
                events.push(new glib.MouseMessage(glib.Message.rightMouseUp, p));
                break;
            }
        });

        element.addEventListener("mousemove", function (event) {
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
            events.push(new glib.MouseMessage(glib.Message.mouseMove, p));
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
        this.position = { x: -1, y: -1 };
        this.delta = { x: 0, y: 0 };
        this.left = { held: false, pressed: false, released: false, prev: false };
        this.right = { held: false, pressed: false, released: false, prev: false };
    },

        old = { x: 0, y: 0 },
        frozen = new IMouse(),
        active = new IMouse(),
        cur = active,
        events = [];

    glib.Mouse = glib.Class({

        static$: {

            init: function (canvasElement) {
                setMouseCapture(document.body, canvasElement, active, events);
            },

            update: function (root) {
                var e;
                updateButton(active.left);
                updateButton(active.right);
                active.delta.x = active.position.x - old.x;
                active.delta.y = active.position.y - old.y;
                old.x = active.position.x;
                old.y = active.position.y;
                while (events.length > 0) {
                    root.processMessage(events.shift());
                }
            },

            freeze: function () {
                cur = frozen;
            },

            unfreeze: function () {
                cur = active;
            },

            position: glib.Property({
                get: function () {
                    return cur.position;
                }
            }),

            delta: glib.Property({
                get: function () {
                    return cur.delta;
                }
            }),

            left: glib.Property({
                get: function () {
                    return cur.left;
                }
            }),

            right: glib.Property({
                get: function () {
                    return cur.right;
                }
            })
        }
    });

}());
