//////////////////////////////////////////////////////////////////////
// Javascript OOP 101

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    function extend(child, proto, force) {
        var names,
            i,
            desc;
        names = Object.getOwnPropertyNames(proto);
        for (i = 0; i < names.length; ++i) {
            if (names[i].indexOf("$") !== -1 || (names[i] in child && !force)) {
                continue;
            }
            desc = Object.getOwnPropertyDescriptor(proto, names[i]);
            if (Object.prototype.toString.call(desc.value) === '[object Object]') {
                Object.defineProperty(child, names[i], desc.value);
            } else {
                Object.defineProperty(child, names[i], desc);
            }
        }
    }

    //////////////////////////////////////////////////////////////////////

    chs.Class = function (desc) {
        var child = {},
            i;

        // constructor
        if (desc.$ !== undefined) {
            child = desc.$;
        }

        // static members
        if (desc.static$ !== undefined) {
            extend(child, desc.static$, true);
        }

        // add the methods and properties
        extend(child.prototype, desc, true);

        // inheritance
        if (desc.hasOwnProperty('inherit$')) {
            if (Object.prototype.toString.call(desc.inherit$) !== '[object Array]') {
                throw new TypeError('Inheritance chain must be an array');
            } else {
                for (i = 0; i < desc.inherit$.length; ++i) {
                    if (!desc.inherit$[i]) {
                        throw new TypeError('Inheriting from undefined class!?');
                    } else {
                        extend(child, desc.inherit$[i], false);
                        extend(child.prototype, desc.inherit$[i].prototype, false);
                    }
                }
            }
        }
        return child;
    };

}());
