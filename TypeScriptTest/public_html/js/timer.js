//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var currentTime,
        deltaTime;

    chs.Timer = chs.Class({

        static$: {

            init: function () {
                currentTime = window.performance.now();
            },

            update: function () {
                var now = window.performance.now();
                deltaTime = now - currentTime;
                currentTime = now;
            },

            time: chs.Property({
                get: function () {
                    return currentTime;
                }
            }),

            delta: chs.Property({
                get: function () {
                    return deltaTime;
                }
            })
        }
    });

}());
