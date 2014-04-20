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
                    extendPrototype(child, desc.statics, true);
                }
                if (desc.methods !== undefined) {
                    checkType(desc.methods, 'Object');
                    extendPrototype(child.prototype, desc.methods, true);
                }
                if (desc.inherits !== undefined) {
                    if (Object.prototype.toString.call(desc.inherits) === '[object Array]') {
                        for (i = 0; i < desc.inherits.length; ++i) {
                            extendPrototype(child, desc.inherits[i], false);
                            extendPrototype(child.prototype, desc.inherits[i].prototype, false);
                        }
                    } else {
                        extendPrototype(child, desc.inherits, false);
                        extendPrototype(child.prototype, desc.inherits.prototype, false);
                    }
                }
            }
            return child;
        },

        //////////////////////////////////////////////////////////////////////
        // super supports only single inheritance...

        extend: function (parent, child, proto) {
            if (proto !== undefined && '$' in proto && typeof proto.$ === 'function' && child.prototype === undefined) {
                child = proto.$;
            }
            extendPrototype(child.prototype, parent.prototype, false);
            if (proto !== undefined) {
                extendPrototype(child.prototype, proto, true);
            }
            return child;
        },

        extender: function (parent, statics, proto) {
            var child = {};
            if (proto !== undefined && '$' in proto && typeof proto.$ === 'function') {
                child = proto.$;
            }
            extendPrototype(child, statics, true);
            if (child.prototype !== undefined) {
                extendPrototype(child.prototype, parent.prototype, false);
                if (proto !== undefined) {
                    extendPrototype(child.prototype, proto, true);
                }
            }
            return child;
        },

        extensionOf: function (parent, descriptor) {
            var child = {},
                i;
            if (descriptor !== undefined) {
                for (i in descriptor) {
                    if (descriptor.hasOwnProperty(i)) {
                        if (!(i in {
                            ctor: true,
                            statics: true,
                            methods: true
                        })) {
                            throw new TypeError("Unknown descriptor field!");
                        }
                    }
                }
                if (descriptor.ctor !== undefined) {
                    child = descriptor.ctor;
                }
                if (descriptor.statics !== undefined) {
                    extendPrototype(child, descriptor.statics, true);
                }
                if (descriptor.methods !== undefined) {
                    extendPrototype(child.prototype, descriptor.methods, true);
                }
            }
            extendPrototype(child.prototype, parent.prototype, false);

            return child;
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

chs.Object = function () { };
