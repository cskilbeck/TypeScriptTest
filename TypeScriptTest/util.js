//////////////////////////////////////////////////////////////////////

/*global window, performance */

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
