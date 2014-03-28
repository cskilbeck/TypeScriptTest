//////////////////////////////////////////////////////////////////////

"use strict"

//////////////////////////////////////////////////////////////////////

HTMLCanvasElement.prototype.relMouseCoords = function (event) {

    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var currentElement = this;
    do {
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;;
    }
    while (currentElement = currentElement.offsetParent);
    return { x: event.x - totalOffsetX, y: event.y - totalOffsetY };
}

//////////////////////////////////////////////////////////////////////

var Mouse = (function () {

    var pub = {
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
        }
    };

    var o = {
        canvas: null,
        oldx: 0,
        oldy: 0
    };

    //////////////////////////////////////////////////////////////////////

    function fixupMouseEvent(event) {
        event = event || window.event;
        var e = {
            e: event,
            target: event.target ? event.target : event.srcElement,
            which: event.which ? event.which : event.button === 1 ? 1 : event.button === 2 ? 3 : event.button === 4 ? 2 : 1,
            x: event.x ? event.x : event.clientX,
            y: event.y ? event.y : event.clientY
        }
        return e;
    }

    //////////////////////////////////////////////////////////////////////

    function addListener(element, name, func) {

        if (element.addEventListener) {
            element.addEventListener(name, func, true);
        }
        else if (element.attachEvent) {
            element.attachEvent(name, func);
        }
    }

    //////////////////////////////////////////////////////////////////////

    function setMouseCapture(element, obj) {

        if (element.setCapture) {
            element.setCapture();
        }

        addListener(element, "mousedown", function (event) {
            if (element.setCapture) {
                element.setCapture();
            }
            event = fixupMouseEvent(event)
            if (event.which == 1) {
                obj.left.held = true;
            }
            if (event.which === 3) {
                obj.right.held = true;
            }
        })

        addListener(element, "losecapture", function () {
            if (element.setCapture) {
                element.setCapture();
            }
        })

        addListener(element, "mouseup", function (event) {

            event = fixupMouseEvent(event);
            if (event.which === 1) {
                obj.left.held = false;
            }
            if (event.which === 3) {
                obj.right.held = false;
            }
        })

        addListener(element, "mousemove", function (event) {
            event = window.event || event;
            if (event && event.preventDefault) {
                event.preventDefault();
            }
            var e = fixupMouseEvent(event);
            var p = o.canvas.relMouseCoords(e);
            pub.x = p.x;
            pub.y = p.y;
            if (e.y < 0) {
                if (element.releaseCapture) {    // allow IE to see mouse clicks outside client area
                    element.releaseCapture();
                }
            }
            else {
                if (element.setCapture) {
                    element.setCapture();
                }
            }

        })
    }

    pub.init = function (canvas) {
        o.canvas = canvas;
        setMouseCapture(document.getElementById("screen"), pub);
    };

    var updateButton = function (b) {
        var delta = b.held ^ b.prev;
        b.pressed = delta & b.held;
        b.released = delta & !b.held;
        b.prev = b.held;
    };

    pub.update = function () {
        updateButton(pub.left);
        updateButton(pub.right);
        pub.deltax = pub.x - o.oldx;
        pub.deltay = pub.y - o.oldy;
        o.oldx = pub.x;
        o.oldy = pub.y;
    };

    return pub;
}());
