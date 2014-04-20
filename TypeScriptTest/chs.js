//////////////////////////////////////////////////////////////////////
// Javascript OOP 101

var chs = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    function extend(child, proto) {
        var names,
            i,
            desc;
        names = Object.getOwnPropertyNames(proto);
        for (i = 0; i < names.length; ++i) {
            if (names[i].indexOf("$") !== -1 || names[i].indexOf("inherits") !== -1 || names[i] in child) {
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

    //////////////////////////////////////////////////////////////////////

    return {

        Class: function (desc) {
            var child = {},
                i;
            if (desc.$ !== undefined) {
                child = desc.$;
            }
            if (desc.static$ !== undefined) {
                extend(child, desc.static$);
            }

            extend(child.prototype, desc);

            if (desc.inherits !== undefined) {
                if (Object.prototype.toString.call(desc.inherits) === '[object Array]') {
                    for (i = 0; i < desc.inherits.length; ++i) {
                        extend(child, desc.inherits[i]);
                        extend(child.prototype, desc.inherits[i].prototype);
                    }
                } else {
                    extend(child, desc.inherits);
                    extend(child.prototype, desc.inherits.prototype);
                }
            }
            return child;
        }

    };

}());
