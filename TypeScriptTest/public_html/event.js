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

        $: function (target, context) {
            this.target = target;
            this.context = context;
        }
    });

    chs.EventSource = chs.Class({

        $: function () {
            this.eventSourceData = {
                handlers: {}
            };
        },

        addEventHandler: function (name, target, context) {
            var self = this.eventSourceData;
            if (!self.handlers.hasOwnProperty(name)) {
                self.handlers[name] = [];
            }
            self.handlers[name].push(new chs.EventHandler(target, context));
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
                l;
            if (hl) {
                for (i = 0, l = hl.length; i < l; ++i) {
                    if (hl[i].target.call(hl[i].context, Array.prototype.slice.call(arguments, 1)) === true) {
                        break;
                    }
                }
            }
        }
    });

}());
