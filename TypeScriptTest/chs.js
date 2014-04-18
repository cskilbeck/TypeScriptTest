//////////////////////////////////////////////////////////////////////
// Javascript OOP 101

var chs = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    function extendPrototype(child, proto, force) {
        var names,
            i,
            desc;
        names = Object.getOwnPropertyNames(proto);
        for (i = 0; i < names.length; ++i) {
            if (names[i] in child && !force) {
                continue;
            }
            desc = Object.getOwnPropertyDescriptor(proto, names[i]);
            if (typeof desc.value === "object") {
                Object.defineProperty(child, names[i], desc.value);
            } else {
                Object.defineProperty(child, names[i], desc);
            }
        }
    }

    return {

        //////////////////////////////////////////////////////////////////////
        // super supports only single inheritance...

        extend: function (child, parent) {
            child.prototype.Super = parent.prototype;
            extendPrototype(child.prototype, parent.prototype, false);
        },

        //////////////////////////////////////////////////////////////////////

        override: function (child, proto) {
            extendPrototype(child.prototype, proto, true);
            return child;
        },

        //////////////////////////////////////////////////////////////////////

        overrideStatic: function (child, proto) {
            extendPrototype(child, proto, true);
            return child;
        }
    };

}());
