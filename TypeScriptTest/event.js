(function () {
    "use strict";

    chs.Event = chs.Class({

        static$: {
            leftMouseDown: 1,
            leftMouseUp: 2,
            rightMouseDown: 3,
            rightMouseUp: 4,
            mouseMove: 5
        },

        $: function (type) {
            this.type = type;
        }
    });

    chs.MouseEvent = chs.Class({ inherits: chs.Event,

        $: function (type, pos) {
            chs.Event.call(this, type);
            this.position = pos;
        },

        x: {
            get: function () {
                return this.position.x;
            }
        },

        y: {
            get: function () {
                return this.position.y;
            }
        }
    });

}());

