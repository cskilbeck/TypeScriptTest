(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    chs.Message = chs.Class({

        static$: {
            leftMouseDown: 1,
            leftMouseUp: 2,
            rightMouseDown: 3,
            rightMouseUp: 4,
            mouseMove: 5,
            touchStart: 6,
            touchEnd: 7,
            touchMove: 8
        },

        $: function (type, global) {
            this.type = type;
            this.global = global;
        },

        isMouseMessage: chs.Property({
            get: function () {
                return this instanceof chs.MouseMessage;
            }
        }),

        isTouchMessage: chs.Property({
            get: function () {
                return this instanceof chs.TouchMessage;
            }
        })
    });

    //////////////////////////////////////////////////////////////////////

    chs.MouseMessage = chs.Class({ inherit$: [chs.Message],

        $: function (type, pos, global) {
            chs.Message.call(this, type);
            this.position = pos;
        },

        x: chs.Property({
            get: function () {
                return this.position.x;
            }
        }),

        y: chs.Property({
            get: function () {
                return this.position.y;
            }
        })
    });

    //////////////////////////////////////////////////////////////////////

    chs.TouchMessage = chs.Class({ inherit$: [chs.Message],

        $: function (type, pos, global) {
            chs.Message.call(this, type, global);
            this.position = pos;
        },

        x: chs.Property({
            get: function () {
                return this.position.x;
            }
        }),

        y: chs.Property({
            get: function () {
                return this.position.y;
            }
        }),

    });

    //////////////////////////////////////////////////////////////////////

    chs.EventHandler = chs.Class({

        $: function (target, context, oneOff) {
            this.target = target;
            this.context = context;
            this.oneOff = oneOff;
        }
    });

    //////////////////////////////////////////////////////////////////////

    chs.EventSource = chs.Class({

        $: function () {
            this.eventSourceData = {
                handlers: {}
            };
        },

        addEventHandler: function (name, target, context, oneShot) {
            var self = this.eventSourceData,
                ctx = context || this;
            if (!self.handlers.hasOwnProperty(name)) {
                self.handlers[name] = [];
            }
            self.handlers[name].push(new chs.EventHandler(target, ctx, oneShot));
        },

        clearEventHandlers: function ()
        {
            this.eventSourceData.handlers.length = 0;
        },

        removeEventHandler: function (name, target) {
            var self = this.eventSourceData,
                f,
                hl = self.handlers[name];
            if (hl) {
                while (true) {
                    f = hl.indexOf(target);
                    if (f === -1) {
                        break;
                    }
                    hl.splice(f, 1);
                }
            }
        },

        dispatchEvent: function (name) {
            var self = this.eventSourceData,
                hl = self.handlers[name],
                i,
                rc;
            if (hl) {
                for (i = 0; i < hl.length; ++i) {  // call these in reverse so children are initialized before parents
                    rc = hl[i].target.apply(hl[i].context, Array.prototype.slice.call(arguments, 1));
                    if (hl[i].oneOff) {
                        hl.splice(i, 1);
                    }
                    if (rc === true) {
                        break;
                    }
                }
            }
        }
    });

}());
