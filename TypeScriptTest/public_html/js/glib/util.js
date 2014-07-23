//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    var b64c =   "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    glib.Util = {

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
                temp[key] = glib.Util.clone(obj[key]);
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

        ease2: function (x, p) {
            // 1 - (3((1-x)^3) - 2((1-x)^4))
            var x1 = 1 - x,
                x3 = Math.pow(x1, p),
                x4 = Math.pow(x1, p + 1);
            return 1 - (3 * x3 - 2 * x4);
        },

        //////////////////////////////////////////////////////////////////////

        lerp: function (start, end, s) {

            var xd = end.x - start.x,
                yd = end.y - start.y,
                e = glib.Util.ease(s);
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

        // rect: { x, y, width, height }
        // line[0].x, line[0].y, line[1].x, line[1].y

        lineIntersectsRectangle: function(rect, line) {
            var t,
                minX = line[0].x,
                maxX = line[1].x,
                dx = maxX - minX;

            if (minX > maxX) {
                t = minX;
                minX = maxX;
                maxX = t;
            }

            if (maxX > rect.x + rect.width) {
                maxX = rect.x + rect.width;
            }

            if (minX < rect.x) {
                minX = rect.x;
            }

            if (minX > maxX) {
                return false;
            }

            var minY = line[0].y;
            var maxY = line[1].y;

            if (Math.abs(dx) > 0.0000001) {
                var a = (line[1].y - line[0].y) / dx;
                var b = line[0].y - a * line[0].x;
                minY = a * minX + b;
                maxY = a * maxX + b;
            }

            if (minY > maxY) {
                t = maxY;
                maxY = minY;
                minY = t;
            }

            if (maxY > rect.y + rect.height) {
                maxY = rect.y + rect.height;
            }

            if (minY < rect.y) {
                minY = rect.y;
            }

            return maxY > minY;
        },

        //////////////////////////////////////////////////////////////////////

        distance: function (a, b) {
            var dx = a.x - b.x,
                dy = a.y - b.y;
            return Math.sqrt(dx * dx + dy * dy);
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
                c = glib.Util.lineDistance(points[i], points[(i + 1) % l], p);
                if (c < 0) {
                    return false;
                }
            }
            return true;
        },

        //////////////////////////////////////////////////////////////////////

        isArray: function (o) {
            return Object.prototype.toString.call(o) === '[object Array]';
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

        createMask: function (image) {
            var d = 1;
            // create a blank one the same size
            // create the mask
        },

        //////////////////////////////////////////////////////////////////////

        circle: function (ctx, x, y, radius) {
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
            ctx.closePath();
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

        fancyRect: function (ctx, x, y, width, height, radius) {
            var r = radius,
                xr = x + width,
                yr = y + height;
            ctx.beginPath();
            ctx.moveTo(x + r[0], y);
            ctx.lineTo(xr - r[1], y);
            ctx.quadraticCurveTo(xr, y, xr, y + r[1]);
            ctx.lineTo(xr, yr - r[2]);
            ctx.quadraticCurveTo(xr, yr, xr - r[2], yr);
            ctx.lineTo(x + r[3], yr);
            ctx.quadraticCurveTo(x, yr, x, yr - r[3]);
            ctx.lineTo(x, y + r[0]);
            ctx.quadraticCurveTo(x, y, x + r[0], y);
            ctx.closePath();
        },

        //////////////////////////////////////////////////////////////////////

        getQuery: function () {
            return glib.Util.queryStringToObject(window.location.search.slice(1));
        },

        //////////////////////////////////////////////////////////////////////

        queryStringToObject: function (url) {

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

        str_rep: function(str, n) {
            var s = '';
            for (;;) {
                if (n & 1) {
                    s += str;
                }
                n >>= 1;
                if (n) {
                    str += str;
                } else {
                    break;
                }
            }
            return s;
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
        },

        atob: function (input) {
            var output = [],
                chr1, chr2, chr3,
                enc1, enc2, enc3, enc4 = "",
                i = 0;

            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                return null;
                //alert("There were invalid base64 characters in the input text.\n" +
                //"Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                //"Expect errors in decoding.");
                //input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            }

            do {
                enc1 = b64c.indexOf(input.charAt(i++)) >>> 0; // this is lame - use a reverse lookup table instead
                enc2 = b64c.indexOf(input.charAt(i++)) >>> 0;
                enc3 = b64c.indexOf(input.charAt(i++)) >>> 0;
                enc4 = b64c.indexOf(input.charAt(i++)) >>> 0;

                chr1 = (enc1 << 2) | (enc2 >>> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >>> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output.push(chr1);

                if (enc3 != 64) {
                    output.push(chr2);
                }
                if (enc4 != 64) {
                    output.push(chr3);
                }

            } while (i < input.length);

            return output;
        }
    };
}());
