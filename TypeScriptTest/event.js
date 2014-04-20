(function () {
    "use strict";

    chs.Event = chs.extensionOf(chs.Object, {

        statics: {
            leftMouseDown: 1,
            leftMouseUp: 2,
            rightMouseDown: 3,
            rightMouseUp: 4,
            mouseMove: 5
        },

        constructor: function (type) {
            this.type = type;
        }
    });

    chs.MouseEvent = chs.extensionOf(chs.Event, {

        constructor: function (type, pos) {
            chs.Event.call(this, type);
            this.position = pos;
        },

        methods: {

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
        }
    });

}());

