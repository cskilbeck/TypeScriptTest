//////////////////////////////////////////////////////////////////////
// Javascript OOP 101
// instanceof not supported
// everything is a mixin...

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    glib.PropertyDescriptor = function (desc) {
        this.desc = desc;
    };

    //////////////////////////////////////////////////////////////////////

    glib.Property = function (desc) {
        return new glib.PropertyDescriptor(desc);
    };

    //////////////////////////////////////////////////////////////////////

    function extend(child, proto, force) {
        var names,
            i,
            desc;
        names = Object.getOwnPropertyNames(proto);
        for (i = 0; i < names.length; ++i) {
            if (names[i].indexOf("$") === -1 && (!(names[i] in child) || force)) {
                desc = Object.getOwnPropertyDescriptor(proto, names[i]);
                if (desc.value instanceof glib.PropertyDescriptor) {
                    Object.defineProperty(child, names[i], desc.value.desc);
                } else {
                    Object.defineProperty(child, names[i], desc);
                }
            }
        }
    }

    //////////////////////////////////////////////////////////////////////

    glib.Class = function (desc) {
        var newClass = desc.$ || {},
            i;

        // static members
        if (desc.static$ !== undefined) {
            extend(newClass, desc.static$, true);
        }

        // add the methods and properties
        extend(newClass.prototype, desc, true);

        // inheritance
        if (desc.hasOwnProperty('inherit$')) {
            if (glib.Util.isArray(desc.inherit$)) {
                for (i = 0; i < desc.inherit$.length; ++i) {
                    if (!desc.inherit$[i]) {
                        throw new TypeError('Inheriting from undefined class!?');
                    } else {
                        extend(newClass, desc.inherit$[i], false);
                        extend(newClass.prototype, desc.inherit$[i].prototype, false);
                    }
                }
            } else {
                extend(newClass, desc.inherit$, false);
                extend(newClass.prototype, desc.inherit$.prototype, false);
            }
        }
        return newClass;
    };

}());
