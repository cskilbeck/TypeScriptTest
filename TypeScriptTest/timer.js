//////////////////////////////////////////////////////////////////////

chs.Timer = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var currentTime,
        deltaTime,

    //////////////////////////////////////////////////////////////////////

        Timer = {

            init: function () {
                currentTime = window.performance.now();
            },

            update: function () {
                var now = window.performance.now();
                deltaTime = now - currentTime;
                currentTime = now;
            }

        };

    //////////////////////////////////////////////////////////////////////

    Object.defineProperty(Timer, "time", {
        get: function () {
            return currentTime;
        }
    });

    //////////////////////////////////////////////////////////////////////

    Object.defineProperty(Timer, "delta", {
        get: function () {
            return deltaTime;
        }
    });

    return Timer;

}());
