//////////////////////////////////////////////////////////////////////

var Util = (function () {
    "use strict";

    var b64c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

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
        },

        /**
         * btoa(data): String
         *
         * Base64 encode some data
         *
         * @param  {UInt8Array} data The data to convert
         * @return {String} The base64 string
         */
        btoa: function (data) {
            var i,
                res = "",
                length = data.length,
                c0,
                c1,
                c2;
            for (i = 0; i < length - 2; i += 3) {
                c0 = data[i] & 0xff;
                c1 = data[i + 1] & 0xff;
                c2 = data[i + 2] & 0xff;
                res += b64c[c0 >>> 2];
                res += b64c[((c0 & 3) << 4) | (c1 >>> 4)];
                res += b64c[((c1 & 15) << 2) | (c2 >>> 6)];
                res += b64c[c2 & 63];
            }
            switch (length % 3) {
            case 2:
                res += b64c[(data[i] & 0xff) >>> 2];
                res += b64c[((data[i] & 3) << 4) | (data[i + 1] >>> 4)];
                res += b64c[((data[i + 1] & 15) << 2)];
                res += "=";
                break;
            case 1:
                res += b64c[(data[i] & 0xff) >>> 2];
                res += b64c[((data[i] & 3) << 4)];
                res += "==";
                break;
            }
            return res;
        }
    };
}());

