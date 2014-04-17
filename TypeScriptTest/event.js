//////////////////////////////////////////////////////////////////////

chs.Event = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Event = function (type) {
        this.type = type;
    };

    //////////////////////////////////////////////////////////////////////

    Event.leftMouseDown = 1;
    Event.leftMouseUp = 2;
    Event.rightMouseDown = 3;
    Event.rightMouseUp = 4;
    Event.mouseMove = 5;

    return Event;

}());

//////////////////////////////////////////////////////////////////////

chs.MouseEvent = (function () {
    "use strict";

    var MouseEvent = function (type, pos) {
        chs.Event.call(this, type);
        this.position = pos;
    };

    chs.extend(MouseEvent, chs.Event);

    return chs.override(MouseEvent, {
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

//////////////////////////////////////////////////////////////////////

// others here...
