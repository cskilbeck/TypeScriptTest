//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var currentTime,
        deltaTime;

    glib.Timer = glib.Class({ inherit$: glib.Drawable,

        static$: {

            init: function () {
                currentTime = performance.now();
            },

            update: function () {
                var now = performance.now();
                deltaTime = now - currentTime;
                currentTime = now;
            },

            time: glib.Property({
                get: function () {
                    return currentTime;
                }
            }),

            delta: glib.Property({
                get: function () {
                    return deltaTime;
                }
            })
        },

        $: function(initialDelay, repeatDelay, callback, context) {
            glib.Drawable.call(this);
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
