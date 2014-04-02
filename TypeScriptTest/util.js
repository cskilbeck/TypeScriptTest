//////////////////////////////////////////////////////////////////////

window.requestAnimFrame = (function () {
    "use strict";

    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
}());

//////////////////////////////////////////////////////////////////////

window.performance = window.performance || {};

performance.now = (function () {
    "use strict";

    return performance.now ||
            performance.mozNow ||
            performance.msNow ||
            performance.oNow ||
            performance.webkitNow ||
        function () {
            return new Date().getTime();
        };
}());

//////////////////////////////////////////////////////////////////////

function ease(x) {
    "use strict";

    var x2 = x * x,
        x3 = x2 * x;
    return 3 * x2 - 2 * x3;
}

//////////////////////////////////////////////////////////////////////

function lerp(start, end, duration, time) {
    "use strict";

    var s = time / duration,
        xd = end.x - start.x,
        yd = end.y - start.y,
        xn = xd * s,
        yn = yd * s,
        e = ease(s),
        x = start.x + xn * e,
        y = start.y + yn * e;
    return {
        x: x,
        y: y
    };
}