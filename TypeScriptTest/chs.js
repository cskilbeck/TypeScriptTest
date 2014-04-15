﻿var chs = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    function extendPrototype(child, proto, force) {
        var names,
            i,
            desc;
        names = Object.getOwnPropertyNames(proto);
        for (i = 0; i < names.length; ++i) {
            if (names[i] in child.prototype && !force) {
                continue;
            }
            desc = Object.getOwnPropertyDescriptor(proto, names[i]);
            Object.defineProperty(child.prototype, names[i], desc);
        }
    }

    return {

        //////////////////////////////////////////////////////////////////////
        // need a way to call super.method()

        extend: function (child, parent, proto) {
            if (proto !== undefined) {
                extendPrototype(child, proto, false);
            }
            extendPrototype(child, parent.prototype, false);
        },

        //////////////////////////////////////////////////////////////////////

        override: function (child, proto) {
            extendPrototype(child, proto, true);
            return child;
        }
    };

}());
