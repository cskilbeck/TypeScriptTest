(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    glib.Message = glib.Class({

        static$: {
            leftMouseDown: 1,
            leftMouseUp: 2,
            rightMouseDown: 3,
            rightMouseUp: 4,
            mouseMove: 5,
            touchStart: 6,
            touchEnd: 7,
            touchMove: 8,
            keyDown: 9,
            keyUp: 10
        },

        $: function (type, global) {
            this.type = type;
            this.global = global;
        }
    });

    //////////////////////////////////////////////////////////////////////

    glib.MouseMessage = glib.Class({ inherit$: glib.Message,

        $: function (type, pos, global) {
            glib.Message.call(this, type);
            this.position = pos;
        },

        x: glib.Property({
            get: function () {
                return this.position.x;
            }
        }),

        y: glib.Property({
            get: function () {
                return this.position.y;
            }
        })
    });

    //////////////////////////////////////////////////////////////////////

    glib.TouchMessage = glib.Class({ inherit$: glib.Message,

        $: function (type, pos, global) {
            glib.Message.call(this, type, global);
            this.position = pos;
        },

        x: glib.Property({
            get: function () {
                return this.position.x;
            }
        }),

        y: glib.Property({
            get: function () {
                return this.position.y;
            }
        }),

    });

    //////////////////////////////////////////////////////////////////////

    glib.KeyDownMessage = glib.Class({ inherit$: glib.Message,

        $: function(keyName, key) {
            glib.Message.call(this, glib.Message.keyDown, true);
            this.name = keyName;
            this.key = key;
        }
    });

    //////////////////////////////////////////////////////////////////////

    glib.KeyUpMessage = glib.Class({ inherit$: glib.Message,

        $: function(keyName, key) {
            glib.Message.call(this, glib.Message.keyUp, true);
            this.name = keyName;
            this.key = key;
        }
    });

    //////////////////////////////////////////////////////////////////////

    glib.EventHandler = glib.Class({

        $: function (target, context, oneOff) {
            this.target = target;
            this.context = context;
            this.oneOff = oneOff;
        }
    });

    //////////////////////////////////////////////////////////////////////

    glib.EventSource = glib.Class({

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
            self.handlers[name].push(new glib.EventHandler(target, ctx, oneShot));
        },

        clearEventHandlers: function ()
        {
            var self = this.eventSourceData,
                i,
                l;
            for (i in self.handlers) {
                self.handlers[i].length = 0;
            }
            self.handlers = {};
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
                for (i = 0; i < hl.length; ++i) {
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
