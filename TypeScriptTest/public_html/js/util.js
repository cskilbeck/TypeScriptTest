//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    var b64c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    chs.Util = {

        //////////////////////////////////////////////////////////////////////

        shallowCopy: function (parent, child) {
            var i;
            for (i in parent) {
                child[i] = parent[i];
            }
        },

        //////////////////////////////////////////////////////////////////////

        clone: function (obj) {
            var temp,
                key;
            if(obj === null || typeof(obj) != 'object') {
                return obj;
            }
            temp = obj.constructor();
            for(key in obj){
                temp[key] = chs.Util.clone(obj[key]);
            }
            return temp;
        },

        //////////////////////////////////////////////////////////////////////

        remove: function (array, object) {
            var i = array.indexOf(object);
            if (i !== -1) {
                array.splice(i, 1);
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

        pointInConvexPoly: function (points, p) {

            var i,
                c,
                l = points.length;

            for (i = 0; i < l; ++i) {
                c = chs.Util.lineDistance(points[i], points[(i + 1) % l], p);
                if (c < 0) {
                    return false;
                }
            }
            return true;
        },

        //////////////////////////////////////////////////////////////////////

        getResponseAsArray: function (xr) {

            function toUint8Array(x) {
                if (x !== null) {
                    return new Uint8Array(x);
                } else {
                    return null;
                }
            }

            if (xr.response !== undefined) {
                return toUint8Array(xr.response);
            }
            if (xr.mozResponseArrayBuffer !== undefined) {
                return toUint8Array(xr.mozResponseArrayBuffer);
            }
            if (xr.mozResponse !== undefined) {
                return toUint8Array(xr.mozResponse);
            }
            if (xr.responseArrayBuffer !== undefined) {
                return toUint8Array(xr.responseArrayBuffer);
            }
            if (xr.responseBody !== null) {
                return toUint8Array(new VBArray(xr.responseBody).toArray());
            }
            return null;
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
            r = r || 0;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(xr - r, y);
            if (r) {
                ctx.quadraticCurveTo(xr, y, xr, y + r);
            }
            ctx.lineTo(xr, yr - r);
            if (r) {
                ctx.quadraticCurveTo(xr, yr, xr - r, yr);
            }
            ctx.lineTo(x + r, yr);
            if (r) {
                ctx.quadraticCurveTo(x, yr, x, yr - r);
            }
            ctx.lineTo(x, y + r);
            if (r) {
                ctx.quadraticCurveTo(x, y, x + r, y);
            }
            ctx.closePath();
        },

        //////////////////////////////////////////////////////////////////////

        queryStringToJSON: function (url) {

            var result = {},
                pairs,
                idx,
                pair;
            if (url) {
                pairs = url.split('&');
                for (idx in pairs) {
                    pair = pairs[idx];
                    if (pair.indexOf('=') !== -1) {
                        pair = pair.split('=');
                        if (!!pair[0]) {
                            result[pair[0].toLowerCase()] = decodeURIComponent(pair[1] || '');
                        } else {
                            result[pair.toLowerCase()] = true;
                        }
                    }
                }
            }
            return result;
        },

        //////////////////////////////////////////////////////////////////////

        objectToQueryString: function (obj) {
            var str = [];
            for(var p in obj)
                if (obj.hasOwnProperty(p)) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
            return str.join("&");
        },

        //////////////////////////////////////////////////////////////////////

        format: function (format) {
            var args = Array.prototype.slice.call(arguments, 1);
            return format.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] !== 'undefined' ? args[number] : match;
            });
        },

        //////////////////////////////////////////////////////////////////////

        pad: function(num, numZeros) {
            var n = Math.abs(num),
                zeros = Math.max(0, numZeros - Math.floor(n).toString().length ),
                zeroString = Math.pow(10, zeros).toString().substr(1);
            if (num < 0) {
                zeroString = '-' + zeroString;
            }
            return zeroString + n;
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

