//////////////////////////////////////////////////////////////////////
// Javascript OOP 101

var chs = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    function extend(child, proto, force) {
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
            } else if (names[i] !== '$') {
                Object.defineProperty(child, names[i], desc);
            }
        }
    }

    function checkType(obj, type) {
        if (Object.prototype.toString.call(obj) !== '[object ' + type + ']') {
            throw new TypeError("object is not an " + type);
        }
    }

    //////////////////////////////////////////////////////////////////////

    return {

        Class: function (desc) {
            var child = {},
                i;
            if (desc !== undefined) {
                for (i in desc) {
                    if (desc.hasOwnProperty(i)) {
                        if (!(i in {
                            inherits: true,
                            ctor: true,
                            statics: true,
                            methods: true
                        })) {
                            throw new TypeError("Unknown desc field!");
                        }
                    }
                }
                if (desc.ctor !== undefined) {
                    checkType(desc.ctor, 'Function');
                    child = desc.ctor;
                }
                if (desc.statics !== undefined) {
                    checkType(desc.statics, 'Object');
                    extend(child, desc.statics, true);
                }
                if (desc.methods !== undefined) {
                    checkType(desc.methods, 'Object');
                    extend(child.prototype, desc.methods, true);
                }
                if (desc.inherits !== undefined) {
                    if (Object.prototype.toString.call(desc.inherits) === '[object Array]') {
                        for (i = 0; i < desc.inherits.length; ++i) {
                            extend(child, desc.inherits[i], false);
                            extend(child.prototype, desc.inherits[i].prototype, false);
                        }
                    } else {
                        extend(child, desc.inherits, false);
                        extend(child.prototype, desc.inherits.prototype, false);
                    }
                }
            }
            return child;
        }

    };

}());
