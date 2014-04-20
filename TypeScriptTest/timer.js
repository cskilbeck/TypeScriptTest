//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var currentTime,
        deltaTime;

    chs.Timer = chs.Class({

        statics: {

            init: function () {
                currentTime = window.performance.now();
            },

            update: function () {
                var now = window.performance.now();
                deltaTime = now - currentTime;
                currentTime = now;
            },

            time: {
                get: function () {
                    return currentTime;
                }
            },

            delta: {
                get: function () {
                    return deltaTime;
                }
            }
        }
    });

}());
