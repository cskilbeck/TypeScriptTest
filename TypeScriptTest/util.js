//////////////////////////////////////////////////////////////////////

var Util = (function () {
    "use strict";

    return {

        //////////////////////////////////////////////////////////////////////

        extendClass: function (parent, child, proto) {

            var i;
            child.prototype = Object.create(parent.prototype);
            for (i in proto) {
                child.prototype[i] = proto[i];
            }
            return child;
        },

        //////////////////////////////////////////////////////////////////////

        ease: function (x) {

            var x2 = x * x,
                x3 = x2 * x;
            return 3 * x2 - 2 * x3;
        },

        //////////////////////////////////////////////////////////////////////

        lerp: function (start, end, s) {

            var xd = end.x - start.x,
                yd = end.y - start.y,
                e = Util.ease(s);
            return {
                x: start.x + xd * e,
                y: start.y + yd * e
            };
        },

        //////////////////////////////////////////////////////////////////////

        constrain: function (x, min, max) {

            if (x < min) {
                x = min;
            }
            if (x > max) {
                x = max;
            }
            return x;
        },

        //////////////////////////////////////////////////////////////////////

        crossProduct: function (a, b, p) {

            return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
        },

        //////////////////////////////////////////////////////////////////////
        // assumes a certain winding order...

        pointInConvexPoly: function (points, p, border) {

            var i,
                b = border || 0;

            for (i = 0; i < points.length; ++i) {
                if (Util.crossProduct(points[i], points[(i + 1) % 4], p) < b) {
                    return false;
                }
            }
            return true;
        }
    };

}());

