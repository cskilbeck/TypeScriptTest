//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var currentTime,
        deltaTime;

    chs.Timer = chs.Class({ inherit$: chs.Drawable,

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
        },

        $: function(initialDelay, repeatDelay, callback, context) {
            chs.Drawable.call(this);
            this.timeout = repeatDelay;
            this.age = initialDelay;
            this.callback = callback;
            this.context = context;
        },

        onUpdate: function(time, deltaTime) {
            this.age -= deltaTime;
            if(this.age <= 0) {
                if(this.timeout) {
                    this.age = this.timeout;
                } else if (this.parent) {
                    this.parent.removeChild(this);
                }
                if (this.callback.call(this.context) === false) {
                    this.parent.removeChild(this);
                }
            }
        }

    });

}());
