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
        var e = {
            e: event,
            target: event.target || event.srcElement,
            which: event.which || event.button === 1 ? 1 : event.button === 2 ? 3 : event.button === 4 ? 2 : 1,
            x: event.x || event.clientX,
            y: event.y || event.clientY
        };
        return e;
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

    function setMouseCapture(element, canvas, pub) {
        if (element.setCapture) {
            element.setCapture();
        }

        addListener(element, "mousedown", function (event) {
            if (element.setCapture) {
                element.setCapture();
            }
            event = fixupMouseEvent(event);
            if (event.which === 1) {
                pub.left.held = true;
            }
            if (event.which === 3) {
                pub.right.held = true;
            }
        });

        addListener(element, "losecapture", function () {
            if (element.setCapture) {
                element.setCapture();
            }
        });

        addListener(element, "mouseup", function (event) {
            event = fixupMouseEvent(event);
            if (event.which === 1) {
                pub.left.held = false;
            }
            if (event.which === 3) {
                pub.right.held = false;
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
            pub.x = p.x;
            pub.y = p.y;
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
        var delta = b.held ^ b.prev;
        b.pressed = delta & b.held;
        b.released = delta & !b.held;
        b.prev = b.held;
    }

    //////////////////////////////////////////////////////////////////////

    var canvas = null,
        screen = null,
        oldx = 0,
        oldy = 0,

        Mouse = {
            x: 0,
            y: 0,
            deltaX: 0,
            deltaY: 0,
            left: {
                held: false,
                pressed: false,
                released: false,
                prev: false
            },
            right: {
                held: false,
                pressed: false,
                released: false,
                prev: false
            },
            init: function (canvasName, screenDivName) {
                canvas = document.getElementById(canvasName);
                screen = document.getElementById(screenDivName);
                setMouseCapture(screen, canvas, Mouse);
            },
            update: function () {
                updateButton(Mouse.left);
                updateButton(Mouse.right);
                Mouse.deltax = Mouse.x - oldx;
                Mouse.deltay = Mouse.y - oldy;
                oldx = Mouse.x;
                oldy = Mouse.y;
            }
        };

    //////////////////////////////////////////////////////////////////////

    return Mouse;

}());
