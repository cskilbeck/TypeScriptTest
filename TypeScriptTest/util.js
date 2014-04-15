//////////////////////////////////////////////////////////////////////

chs.Util = (function () {
    "use strict";

    var b64c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    return {

        //////////////////////////////////////////////////////////////////////

        shallowCopy: function (parent, child) {
            var i;
            for (i in parent) {
                child[i] = parent[i];
            }
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
                e = chs.Util.ease(s);
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

        lineDistance: function (a, b, p) {
            var dx = b.x - a.x,
                dy = b.y - a.y,
                l = Math.sqrt(dx * dx + dy * dy);
            return (dx * (p.y - a.y) - dy * (p.x - a.x)) / l;
        },

        //////////////////////////////////////////////////////////////////////
        // assumes a certain winding order...

        pointInConvexPoly: function (points, p, border) {

            var i,
                c,
                b = border || 0,
                l = points.length;

            for (i = 0; i < l; ++i) {
                c = chs.Util.lineDistance(points[i], points[(i + 1) % l], p);
                if (c < -b) {
                    return false;
                }
            }
            return true;
        },

        //////////////////////////////////////////////////////////////////////

        getResponseAsArray: function (xr) {

            if (xr.response !== undefined) {
                return new Uint8Array(xr.response);
            }
            if (xr.mozResponseArrayBuffer !== undefined) {
                return new Uint8Array(xr.mozResponseArrayBuffer);
            }
            if (xr.mozResponse !== undefined) {
                return new Uint8Array(xr.mozResponse);
            }
            if (xr.responseArrayBuffer !== undefined) {
                return new Uint8Array(xr.responseArrayBuffer);
            }
            return new Uint8Array(new VBArray(xr.responseBody).toArray());
        },

        //////////////////////////////////////////////////////////////////////

        rect: function (ctx, x, y, width, height) {
            var xr = x + width,
                yr = y + height;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(xr, y);
            ctx.lineTo(xr, yr);
            ctx.lineTo(x, yr);
            ctx.closePath();
        },

        //////////////////////////////////////////////////////////////////////

        roundRect: function (ctx, x, y, width, height, radius) {
            var r = Math.min(radius, Math.min(width / 2, height / 2)),
                xr = x + width,
                yr = y + height;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(xr - r, y);
            ctx.quadraticCurveTo(xr, y, xr, y + r);
            ctx.lineTo(xr, yr - r);
            ctx.quadraticCurveTo(xr, yr, xr - r, yr);
            ctx.lineTo(x + r, yr);
            ctx.quadraticCurveTo(x, yr, x, yr - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
        },

        //////////////////////////////////////////////////////////////////////

        getExtension: function (url) {
            return url.match(/(?:(?:[\w\W]+)\.)([\w\W]+?)(\?|$)/)[1].toLowerCase();
        },

        //////////////////////////////////////////////////////////////////////
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
                length = data.length || data.byteLength,
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

