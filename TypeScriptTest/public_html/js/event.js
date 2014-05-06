(function () {
    "use strict";

    chs.Message = chs.Class({

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

    chs.MouseMessage = chs.Class({
        inherit$: [chs.Message],

        $: function (type, pos) {
            chs.Message.call(this, type);
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

    chs.EventHandler = chs.Class({

        $: function (target, context, oneOff) {
            this.target = target;
            this.context = context;
            this.oneOff = oneOff;
        }
    });

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
