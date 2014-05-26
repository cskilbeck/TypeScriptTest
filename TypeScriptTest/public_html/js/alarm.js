(function () {
    "use strict";

    chs.Alarm = chs.Class({ inherit$: chs.Drawable,

        $: function(initialDelay, timeout, repeat, callback, context) {
            chs.Drawable.call(this);
            this.timeout = timeout;
            this.age = initialDelay;
            this.repeat = repeat;
            this.callback = callback;
            this.context = context;
        },

        onUpdate: function(time, deltaTime) {
            this.age -= deltaTime;
            if(this.age <= 0) {
                if(this.repeat) {
                    this.age = this.timeout;
                } else if (this.parent) {
                    this.parent.removeChild(this);
                }
                this.callback.call(this.context);
            }
        }

    });

}());
