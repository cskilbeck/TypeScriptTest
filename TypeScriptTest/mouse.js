//////////////////////////////////////////////////////////////////////

HTMLCanvasElement.prototype.relMouseCoords = function (event) {
    "use strict";

    var totalOffsetX = 0,
        totalOffsetY = 0,
        currentElement = this;
    do {
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
        currentElement = currentElement.offsetParent;
    } while (currentElement !== null);
    return { x: event.x - totalOffsetX, y: event.y - totalOffsetY };
};

//////////////////////////////////////////////////////////////////////

var Mouse = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    function fixupMouseEvent(event) {
        event = event || window.event;
        return {
            e: event,
            target: event.target || event.srcElement,
            which: event.which || event.button === 1 ? 1 : event.button === 2 ? 3 : event.button === 4 ? 2 : 1,
            x: event.x || event.clientX,
            y: event.y || event.clientY
        };
    }

    //////////////////////////////////////////////////////////////////////

    function addListener(element, name, func) {
        if (element.addEventListener) {
            element.addEventListener(name, func, true);
        } else if (element.attachEvent) {
            element.attachEvent(name, func);
        }
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

    function setMouseCapture(element, canvas, mouse) {
        if (element.setCapture) {
            element.setCapture();
        }

        document.oncontextmenu = function (e) {
            e.cancelBubble = true;
            return false;
        };

        addListener(element, "mousedown", function (event) {
            if (element.setCapture) {
                element.setCapture();
            }
            event = fixupMouseEvent(event);
            if (event.which === 1) {
                mouse.left.held = true;
            }
            if (event.which === 3) {
                mouse.right.held = true;
            }
            return false;
        });

        addListener(element, "losecapture", function () {
            if (element.setCapture) {
                element.setCapture();
            }
        });

        addListener(element, "mouseup", function (event) {
            event = fixupMouseEvent(event);
            if (event.which === 1) {
                mouse.left.held = false;
            }
            if (event.which === 3) {
                mouse.right.held = false;
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
            p = canvas.relMouseCoords(e);
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

        Mouse = {

            init: function (canvasElement, screenElement) {
                canvas = canvasElement;
                screen = screenElement;
                setMouseCapture(screen, canvas, active);
            },
            update: function () {
                updateButton(active.left);
                updateButton(active.right);
                active.delta.x = active.position.x - old.x;
                active.delta.y = active.position.y - old.y;
                old.x = active.position.x;
                old.y = active.position.y;
            },
            freeze: function () {
                cur = frozen;
            },
            unfreeze: function () {
                cur = active;
            }
        };

    //////////////////////////////////////////////////////////////////////

    Object.defineProperty(Mouse, "position", {
        get: function () {
            return cur.position;
        }
    });

    Object.defineProperty(Mouse, "delta", {
        get: function () {
            return cur.delta;
        }
    });

    Object.defineProperty(Mouse, "left", {
        get: function () {
            return cur.left;
        }
    });

    Object.defineProperty(Mouse, "right", {
        get: function () {
            return cur.right;
        }
    });

    //////////////////////////////////////////////////////////////////////

    return Mouse;

}());
