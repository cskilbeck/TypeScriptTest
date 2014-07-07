(function(environ) {
    environ.glib = {};

    Object.defineProperty(environ, "none", {
        value: undefined,
        configurable: false
    });
}(window));
(function () {
    "use strict";

    function id() {
        var ua = navigator.userAgent,
            tem,
            M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'MSIE ' + (tem[1] || '');
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\bOPR\/(\d+)/);
            if (tem !== null) {
                return 'Opera ' + tem[1];
            }
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        tem = ua.match(/version\/(\d+)/i);
        if (tem !== null) {
            M.splice(1, 1, tem[1]);
        }
        return M.join(' ');
    }

    var browser = id().split(' ');

    glib.Browser = {

        type: browser[0],
        version: parseInt(browser[1], 10)
    };

}());
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
        var newClass = {},
            i;

        // constructor
        if (desc.$ !== undefined) {
            newClass = desc.$;
        }

        // static members
        if (desc.static$ !== undefined) {
            extend(newClass, desc.static$, true);
        }

        // add the methods and properties
        extend(newClass.prototype, desc, true);

        // inheritance
        if (desc.hasOwnProperty('inherit$')) {
            if (Object.prototype.toString.call(desc.inherit$) !== '[object Array]') {
                extend(newClass, desc.inherit$, false);
                extend(newClass.prototype, desc.inherit$.prototype, false);
            } else {
                for (i = 0; i < desc.inherit$.length; ++i) {
                    if (!desc.inherit$[i]) {
                        throw new TypeError('Inheriting from undefined class!?');
                    } else {
                        extend(newClass, desc.inherit$[i], false);
                        extend(newClass.prototype, desc.inherit$[i].prototype, false);
                    }
                }
            }
        }
        return newClass;
    };

}());
(function () {
    "use strict";

    glib.User = {
        id: 0,
        name: "",
        picture: null,
        providerName: ""
    };

}());(function () {
    "use strict";

    glib.OAuth = glib.Class({

        static$: {
            login: function (callback, context) {
                var session_id,
                    provider_id,
                    anon,
                    login_error;
                session_id = glib.Cookies.get('session_id');
                provider_id = glib.Cookies.get('provider_id') || 0;
                login_error = glib.Cookies.get('login_error');
                if(session_id === null) {
                    glib.WebService.post("anon", {}, {}, function(data) {
                        if (data && !data.error) {
                            glib.Cookies.set('session_id', data.session_id);
                            glib.Cookies.set('anon_user_id', data.user_id);
                            glib.User.id = data.user_id;
                            callback.call(context);
                        } else {
                            console.log("Error getting anon user id");
                        }
                    });
                } else {
                    callback.call(context);
                }
            }
        }
    });

} ());//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    (function() {
        var lastTime = 0,
            x,
            vendors = ['webkit', 'moz'];
        for(x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime(),
                    timeToCall = Math.max(0, 16 - (currTime - lastTime)),
                    id = window.setTimeout(function() {
                            callback(currTime + timeToCall);
                        }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }

        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
        }
    }());

    //////////////////////////////////////////////////////////////////////

    window.performance = window.performance || {};

    if (!Date.now) {
        Date.now = function now() {
            return new Date().getTime();
        };
    }

    performance.now = (function () {

        return performance.now ||
                performance.mozNow ||
                performance.msNow ||
                performance.oNow ||
                performance.webkitNow ||
            function () {
                return Date.now();
            };
    }());

    //////////////////////////////////////////////////////////////////////

    glib.addEventListener = function(el, name, callback) {
        if (el.addEventListener) {
            el.addEventListener(name, callback, false);
        } else if (el.attachEvent) {
            el.attachEvent(name, callback);
        } // else tough shit
    };

    //////////////////////////////////////////////////////////////////////

    if (!window.location.origin) {
        window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
    }

    //////////////////////////////////////////////////////////////////////

    (function () {

        try {
            var a = new Uint8Array(1);
            return; //no need
        } catch (e) { }

        function subarray(start, end) {
            /*jshint validthis: true */
            return this.slice(start, end);
        }

        function setArray(array, offset) {
            /*jshint validthis: true */
            var i,
                n,
                o = offset || 0;
            for (i = 0, n = array.length; i < n; ++i, ++offset) {
                this[o] = array[i] & 0xFF;
            }
        }

        function TypedArray(arg1) {
            var result,
                i;
            if (typeof arg1 === "number") {
                result = [];
                result.length = arg1;
                for (i = 0; i < arg1; ++i) {
                    result[i] = 0;
                }
            } else {
                result = arg1.slice(0);
            }
            result.subarray = subarray;
            result.buffer = result;
            result.byteLength = result.length;
            result.set = setArray;
            if (typeof arg1 === "object" && arg1.buffer) {
                result.buffer = arg1.buffer;
            }
            return result;
        }

        window.Uint8Array = TypedArray;
        window.Uint32Array = TypedArray;
        window.Int32Array = TypedArray;
    }());

}());

//////////////////////////////////////////////////////////////////////
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

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    glib.Message = glib.Class({

        static$: {
            leftMouseDown: 1,
            leftMouseUp: 2,
            rightMouseDown: 3,
            rightMouseUp: 4,
            mouseMove: 5,
            touchStart: 6,
            touchEnd: 7,
            touchMove: 8,
            keyDown: 9,
            keyUp: 10
        },

        $: function (type, global) {
            this.type = type;
            this.global = global;
        }
    });

    //////////////////////////////////////////////////////////////////////

    glib.MouseMessage = glib.Class({ inherit$: glib.Message,

        $: function (type, pos, global) {
            glib.Message.call(this, type);
            this.position = pos;
        },

        x: glib.Property({
            get: function () {
                return this.position.x;
            }
        }),

        y: glib.Property({
            get: function () {
                return this.position.y;
            }
        })
    });

    //////////////////////////////////////////////////////////////////////

    glib.TouchMessage = glib.Class({ inherit$: glib.Message,

        $: function (type, pos, global) {
            glib.Message.call(this, type, global);
            this.position = pos;
        },

        x: glib.Property({
            get: function () {
                return this.position.x;
            }
        }),

        y: glib.Property({
            get: function () {
                return this.position.y;
            }
        }),

    });

    //////////////////////////////////////////////////////////////////////

    glib.KeyDownMessage = glib.Class({ inherit$: glib.Message,

        $: function(keyName, key) {
            glib.Message.call(this, glib.Message.keyDown, true);
            this.name = keyName;
            this.key = key;
        }
    });

    //////////////////////////////////////////////////////////////////////

    glib.KeyUpMessage = glib.Class({ inherit$: glib.Message,

        $: function(keyName, key) {
            glib.Message.call(this, glib.Message.keyUp, true);
            this.name = keyName;
            this.key = key;
        }
    });

    //////////////////////////////////////////////////////////////////////

    glib.EventHandler = glib.Class({

        $: function (target, context, oneOff) {
            this.target = target;
            this.context = context;
            this.oneOff = oneOff;
        }
    });

    //////////////////////////////////////////////////////////////////////

    glib.EventSource = glib.Class({

        $: function () {
            this.eventSourceData = {
                handlers: {}
            };
        },

        addEventHandler: function (name, target, context, oneShot) {
            var self = this.eventSourceData,
                ctx = context || this;
            if (!self.handlers.hasOwnProperty(name)) {
                self.handlers[name] = [];
            }
            self.handlers[name].push(new glib.EventHandler(target, ctx, oneShot));
        },

        clearEventHandlers: function ()
        {
            var self = this.eventSourceData,
                i,
                l;
            for (i in self.handlers) {
                self.handlers[i].length = 0;
            }
            self.handlers = {};
        },

        removeEventHandler: function (name, target) {
            var self = this.eventSourceData,
                f,
                hl = self.handlers[name];
            if (hl) {
                while (true) {
                    f = hl.indexOf(target);
                    if (f === -1) {
                        break;
                    }
                    hl.splice(f, 1);
                }
            }
        },

        dispatchEvent: function (name) {
            var self = this.eventSourceData,
                hl = self.handlers[name],
                i,
                rc;
            if (hl) {
                for (i = 0; i < hl.length; ++i) {
                    rc = hl[i].target.apply(hl[i].context, Array.prototype.slice.call(arguments, 1));
                    if (hl[i].oneOff) {
                        hl.splice(i, 1);
                    }
                    if (rc === true) {
                        break;
                    }
                }
            }
        }
    });

}());
(function () {
    "use strict";

    var x,
        y,
        z,
        w,
        v;

    glib.Random = glib.Class({

        $: function (seed) {
            seed = seed || (Date.now() >>> 0);
            this.seed(seed);
        },

        seed: function (seed) {
            x = 123456789;
            y = 362436069;
            z = 521288629;
            w = 88675123;
            v = seed;
        },

        next: function () {
            var t = (x ^ (x >>> 7)) >>> 0;
            x = y;
            y = z;
            z = w;
            w = v;
            v = (v ^ (v << 6)) ^ (t ^ (t << 13)) >>> 0;
            return ((y + y + 1) * v) >>> 16;
        }
    });

}());
glib.Cookies = (function () {
    "use strict";

    return {

        set: function (name, value, expiry) {
            var d = new Date(),
                expires;
            d.setTime(d.getTime() + ((expiry || 1) * 24 * 60 * 60 * 1000));
            expires = "expires=" + d.toGMTString();
            document.cookie = name + "=" + value + "; " + expires + ";path=/";
        },

        get: function (name) {
            var cname = name + "=",
                ca,
                i,
                c,
                v;
            ca = document.cookie.split(';');
            for (i = 0; i < ca.length; i++) {
                c = ca[i].trim();
                if (c.indexOf(cname) === 0) {
                    v = decodeURIComponent(c.substring(cname.length, c.length));
                    return v;
                }
            }
            return null;
        },

        remove: function (name) {
            glib.Cookies.set(name, "X", -1);
        }
    };

}());/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    function send(url, callback, progressCallback, context, method, data, binary, crossDomain) {

        var cd = crossDomain === undefined ? false : crossDomain,
            xr;

        if (glib.Browser.type === 'MSIE' && glib.Browser.version <= 10 && crossDomain) {
            xr = new XDomainRequest();
            xr.open(method, url);
            xr.onerror = function () {};
            xr.onprogress = function () {};
            xr.timeout = 5000;
            xr.ontimeout = function () {
                xr.status = 408;
                xr.responseText = "";
                callback.call(context, url, xr);
            };
            xr.onload = function () {
                if(xr.responseText) {
                    xr.status = 200;    // feck
                }
                callback.call(context, url, xr);
            };
        } else {
            xr = new XMLHttpRequest();
            xr.open(method, url);
            if (binary) {
                xr.responseType = 'arraybuffer';
            }
            xr.onreadystatechange = function () {
                var contentType;
                console.log(url + " : " + xr.status.toString());
                if (xr.readyState === XMLHttpRequest.DONE) {
                    contentType = xr.getResponseHeader("Content-Type");
                    callback.call(context, url, xr);
                }
            };
            xr.ontimeout = function () {
                callback.call(context, url, xr);
            };
            glib.addEventListener(xr, "error", function () {
                console.log("Error!");
            });
            xr.onprogress = function (e) {
                if (progressCallback) {
                    progressCallback.call(context, url, e);
                }
            };
            if (method === 'POST') {
                xr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            }
        }
        xr.send(data);
        return xr;
    }

    //////////////////////////////////////////////////////////////////////

    glib.ajax = glib.Class({

        static$: {

            url: function (url, data, force) {
                var query = [],
                    key,
                    u,
                    q = "",
                    a = "?";
                for (key in data) {
                    query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
                    q = "?";
                    a = "&";
                }
                u = url + q + query.join('&') + (force ? (a + (new Date()).getTime() + '=1') : "");
                return u;
            },

            //////////////////////////////////////////////////////////////////////

            get: function (url, callback, progressCallback, context, binary, crossDomain) {

                send(url, callback, progressCallback, context, 'GET', null, binary, crossDomain);
            },

            //////////////////////////////////////////////////////////////////////

            post: function (url, data, callback, progressCallback, context, binary, crossDomain) {

                var query = [],
                    key;
                for (key in data) {
                    query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
                }
                send(url, callback, progressCallback, context, 'POST', query.join('&'), binary, crossDomain);
            }
        }
    });

}());

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

glib.List = (function () {
    "use strict";

    var List = function (nodeName) {
            this.nodeName = nodeName;
            this.root = { item: null, next: null, prev: null };
            this.root.next = this.root;
            this.root.prev = this.root;
            this.size = 0;
        },
        sortCallback,
        sortContext;

    //////////////////////////////////////////////////////////////////////

    function makeListNode(n, p) {

        var r = {
            item: null,
            next: n,
            prev: p
        };
        n.prev = r;
        p.next = r;
        return r;
    }

    function merge_sort(size, list) {

        var leftSize,
            rightSize,
            midPoint,
            left,
            right,
            head,
            tail,
            insertPoint,
            runBegin,
            runEnd,
            i;

        if (size > 2) {

            leftSize = size >>> 1;
            rightSize = size - leftSize;
            midPoint = list.next;

            for (i = 0; i < leftSize; i += 1) {
                midPoint = midPoint.next;
            }

            left = makeListNode(list.next, midPoint.prev);  // THIS IS KILLING THE GC - MAKE IT NOT DO THAT!
            right = makeListNode(midPoint, list.prev);

            merge_sort(leftSize, left);
            merge_sort(rightSize, right);

            insertPoint = right;
            runEnd = left.next;

            while (runEnd !== left) {

                do {
                    insertPoint = insertPoint.next;
                } while (insertPoint !== right && sortCallback.call(sortContext, insertPoint.item, runEnd.item) > 0);

                if (insertPoint !== right) {

                    runBegin = runEnd;
                    do {
                        runEnd = runEnd.next;
                    } while (runEnd !== left && sortCallback.call(sortContext, runEnd.item, insertPoint.item) >= 0);

                    runBegin.prev = insertPoint.prev;
                    insertPoint.prev.next = runBegin;
                    insertPoint.prev = runEnd.prev;
                    runEnd.prev.next = insertPoint;

                } else {

                    runEnd.prev = right.prev;
                    right.prev.next = runEnd;
                    right.prev = left.prev;
                    left.prev.next = right;
                    break;
                }
            }

            right.next.prev = list;
            right.prev.next = list;
            list.prev = right.prev;
            list.next = right.next;

        } else if (size === 2 && sortCallback.call(sortContext, list.prev.item, list.next.item) > 0) {

            head = list.next;
            tail = list.prev;
            list.next = tail;
            list.prev = head;
            head.next = list;
            head.prev = tail;
            tail.next = head;
            tail.prev = list;
        }
    }

    //////////////////////////////////////////////////////////////////////

    List.prototype = {

        sort: function (callback, context) {
            sortCallback = callback;
            sortContext = context;
            merge_sort(this.size, this.root);
        },

        empty: function () {
            return this.size === 0;
        },

        clear: function () {
            this.root.next = this.root;
            this.root.prev = this.root;
            this.size = 0;
        },

        headNode: function () {
            return this.root.next;
        },

        begin: function () {
            return this.root.next;
        },

        end: function () {
            return this.root;
        },

        tailNode: function () {
            return this.root.prev;
        },

        head: function () {
            return this.root.next.item;
        },

        tail: function () {
            return this.root.prev.item;
        },

        next: function (obj) {
            return obj[this.nodeName].next.item;
        },

        prev: function (obj) {
            return obj[this.nodeName].prev.item;
        },

        insertBefore: function (objBefore, obj) {
            var n = objBefore[this.nodeName],
                node = obj[this.nodeName];
            node.next = n;
            node.prev = n.prev;
            n.next.prev = node;
            n.prev = node;
            this.size += 1;
        },

        insertAfter: function (objAfter, obj) {
            var n = objAfter[this.nodeName],
                node = obj[this.nodeName];
            node.prev = n;
            node.next = n.next;
            n.prev.next = node;
            n.next = node;
            this.size += 1;
        },

        pushFront: function (obj) {
            var node = obj[this.nodeName];
            node.prev = this.root;
            node.next = this.root.next;
            this.root.next.prev = node;
            this.root.next = node;
            this.size += 1;
        },

        pushBack: function (obj) {
            var node = obj[this.nodeName];
            node.prev = this.root.prev;
            node.next = this.root;
            this.root.prev.next = node;
            this.root.prev = node;
            this.size += 1;
        },

        add: function (obj) {
            this.pushBack(obj);
        },

        popFront: function () {
            if (!this.empty()) {
                var node = this.root.next;
                node.prev.next = node.next;
                node.next.prev = node.prev;
                this.size -= 1;
                return node.item;
            }
            return null;
        },

        popBack: function () {
            if (!this.empty()) {
                var node = this.root.prev;
                node.prev.next = node.next;
                node.next.prev = node.prev;
                this.size -= 1;
                return node.item;
            }
            return null;
        },

        removeNode: function (node) {
            node.prev.next = node.next;
            node.next.prev = node.prev;
            this.size -= 1;
        },

        remove: function (obj) {
            this.removeNode(obj[this.nodeName]);
        },

        moveToFront: function (item) {
            var node = item[this.nodeName];
            node.prev.next = node.next;
            node.next.prev = node.prev;
            this.root.next.prev = node;
            this.root.next = node;
        },

        moveToBack: function (item) {
            var node = item[this.nodeName];
            node.prev.next = node.next;
            node.next.prev = node.prev;
            this.root.prev.next = node;
            this.root.prev = node;
        },

        forEach: function (callback, context) {
            var node = this.root.next,
                next,
                index = 0;
            while (node !== this.root) {
                next = node.next;
                if (callback.call(context, node.item, index) === false) {
                    return false;
                }
                node = next;
                index += 1;
            }
            return true;
        },

        reverseForEach: function (callback, context) {
            var node = this.root.prev,
                next,
                index = 0;
            while (node !== this.root) {
                next = node.prev;
                if (callback.call(context, node.item, index) === false) {
                    return false;
                }
                node = next;
                index += 1;
            }
            return true;
        },

        removeIf: function (callback, context) {
            var node = this.root.next,
                next,
                // safe = 0,
                removed = 0;
            while (node !== this.root) {
                // if (safe > 1000) {
                //     debugger;
                // }
                // safe += 1;
                next = node.next;
                if (callback.call(context, node.item) === true) {
                    node.prev.next = next;
                    node.next.prev = node.prev;
                    removed += 1;
                }
                node = next;
            }
            this.size -= removed;
            return removed;
        },

        findFirstOf: function (callback, context) {
            var node = this.root.next,
                next,
                index = 0;
            while (node !== this.root) {
                next = node.next;
                if (callback.call(context, node.item, index) === true) {
                    return node.item;
                }
                node = next;
                index += 1;
            }
            return null;
        },

        findLastOf: function (callback, context) {
            var node = this.root.next,
                prev,
                index = 0;
            while (node !== this.root) {
                prev = node.prev;
                if (callback.call(context, node.item, index) === true) {
                    return node.item;
                }
                node = prev;
                index -= 1;
            }
            return null;
        },

        select: function (newListNodeName, callback, context) {
            var list = new List(newListNodeName),
                node = this.root.next,
                index = 0,
                next;
            while (node !== this.root) {
                next = node.next;
                if (callback.call(context, node.item, index) === true) {
                    list.pushBack(node.item);
                }
                node = next;
                index += 1;
            }
            return list;
        },

        reverseFind: function (callback, context) {
            var node = this.root.prev,
                index = 0,
                prev;
            while (node !== this.root) {
                prev = node.prev;
                if (callback.call(context, node.item, index) === true) {
                    return node.item;
                }
                node = prev;
                index += 1;
            }
            return null;
        },

        toString: function () {
            var s = 'list (' + this.size.toString() + ') <',
                sep = "";
            this.forEach(function (i) {
                s += sep + i.toString();
                sep = ',';
            });
            return s + '>';
        }
    };

    //////////////////////////////////////////////////////////////////////

    List.Node = function (obj) {
        return {
            item: obj,
            next: null,
            prev: null
        };
    };

    return List;
}());
//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////
    // limit cache size...

    var canvasCache = [];

    glib.Canvas = glib.Class({

        static$: {
            create: function (w, h) {
                var n,
                    l,
                    c,
                    r,
                    s,
                    i,
                    xd,
                    yd;

                for (n = canvasCache.length - 1; n >= 0; --n) {
                    c = canvasCache[n];
                    xd = c.width - w;
                    yd = c.height - h;
                    if (xd >= 0 && yd >= 0) {
                        if (xd + yd === 0) {
                            r = c;
                            i = n;
                            break;
                        }
                        if (s === undefined || (xd + yd) < s) {
                            r = c;
                            i = n;
                            s = xd + yd;
                        }
                    }
                }
                if (r) {
                    canvasCache.splice(i, 1);
                    r.clear();
                } else {
                    r = new glib.Canvas(w, h);
                }
                return r;
            },
            showCache: function () {
                canvasCache.forEach(function(c) {
                    glib.Debug.print(c.width, c.height);
                });
            }
        },

        $: function(w, h) {
            this.width = Math.ceil(w) >>> 0;
            this.height = Math.ceil(h) >>> 0;
            this.canvas = document.createElement("canvas");
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.context = this.canvas.getContext("2d");
        },

        clear: function () {
            this.context.setTransform(1, 0, 0, 1, 0, 0);
            this.context.clearRect(0, 0, this.width, this.height);
        },

        destroy: function() {
            canvasCache.push(this);
        }

    });

}());
(function () {
    "use strict";

    function copy(m, n) {
        m[0] = n[0];
        m[1] = n[1];
        m[2] = n[2];
        m[3] = n[3];
        m[4] = n[4];
        m[5] = n[5];
    }

    glib.Matrix = glib.Class({

        // constructor

        $: function () {
            this.m = [1, 0, 0, 1, 0, 0];
        },

        // replace contents

        set: function (a, b, c, d, e, f) {
            var m = this.m;
            m[0] = a;
            m[1] = b;
            m[2] = c;
            m[3] = d;
            m[4] = e;
            m[5] = f;
            return this;
        },

        // copy into another matrix

        copyTo: function (o) {
            copy(o.m, this.m);
        },

        // copy from another matrix

        copyFrom: function (o) {
            copy(this.m, o.m);
        },

        // set it to the identity matrix

        setIdentity: function () {
            this.set(1, 0, 0, 1, 0, 0);
            return this;
        },

        // dest = this * b

        multiplyInto: function(b, dest) {
            var m = this.m,
                y = b.m,
                d = dest.m,
                r00 = m[0] * y[0] + m[2] * y[1],
                r01 = m[1] * y[0] + m[3] * y[1],
                r10 = m[0] * y[2] + m[2] * y[3],
                r11 = m[1] * y[2] + m[3] * y[3],
                r20 = m[0] * y[4] + m[2] * y[5] + m[4],
                r21 = m[1] * y[4] + m[3] * y[5] + m[5];
            d[0] = r00;
            d[1] = r01;
            d[2] = r10;
            d[3] = r11;
            d[4] = r20;
            d[5] = r21;
            return dest;
        },

        // this = this * b

        multiply: function (b) {
            return this.multiplyInto(b, this);
        },

        // translate by t.x, t.y

        translate: function (t) {
            var m = this.m;
            m[4] += m[0] * t.x + m[2] * t.y;
            m[5] += m[1] * t.x + m[3] * t.y;
            return this;
        },

        // don't use this...

        translation: glib.Property({
            get: function () {
                return { x: this.m[4], y: this.m[5] };
            },
            set: function (t) {
                this.m[4] = t.x;
                this.m[5] = t.y;
            }
        }),

        // scale it by s.x, s.y

        scale: function (s) {
            var x = this.m;
            x[0] *= s.x;
            x[1] *= s.x;
            x[2] *= s.y;
            x[3] *= s.y;
            return this;
        },

        // rotate by radians

        rotate: function (radians) {
            var m = this.m,
                cos = Math.cos(radians),
                sin = Math.sin(radians),
                r00 = m[0] * cos + m[2] * -sin,
                r01 = m[1] * cos + m[3] * -sin,
                r10 = m[0] * sin + m[2] * cos,
                r11 = m[1] * sin + m[3] * cos;
            m[0] = r00;
            m[1] = r01;
            m[2] = r10;
            m[3] = r11;
            return this;
        },

        // dest = inverse(this) - good for picking

        invert: function (dest) {
            var m = this.m,
                det = m[0] * m[3] - m[1] * m[2];
            if (det < 1.0e-6) {
                return this.copyTo(dest);
            }
            det = 1 / det;
            return dest.set(m[3] * det, m[1] * -det, m[2] * -det, m[0] * det,
                            (m[2] * m[5] - m[3] * m[4]) * det,
                            (m[0] * m[5] - m[1] * m[4]) * -det);
        },

        // apply to point p

        apply: function (p) {
            var m = this.m;
            return {
                x: p.x * m[0] + p.y * m[2] + m[4],
                y: p.x * m[1] + p.y * m[3] + m[5]
            };
        },

        // transform array of points in place

        transform: function (p) {
            var m = this.m,
                i,
                x,
                y;
            for (i = 0; i < p.length; ++i) {
                x = p[i].x;
                y = p[i].y;
                p[i].x = x * m[0] + y * m[2] + m[4];
                p[i].y = x * m[1] + y * m[3] + m[5];
            }
            return p;
        },

        // stuff it into a context

        setContextTransform: function (context) {
            var m = this.m;
            context.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
        }

    });

}());
//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    glib.Drawable = glib.Class({ inherit$: glib.EventSource,

        $: function () {
            glib.EventSource.call(this);
            this.drawableData = {
                position: { x: 0, y: 0 },
                dimensions: { width: 0, height: 0 },
                padding: { left: 0, top: 0, right: 0, bottom: 0},    // how much (or -ive) padding required on the sides
                rotation: 0,
                scale: { x: 1, y: 1 },
                drawScale: { x: 1, y: 1 },
                dirty: true,
                visible: true,
                myZindex: 0,
                baseZindex: 0,
                reorder: false,
                transparency: 255,
                pivot: { x: 0, y: 0 },
                mouseIsOver: false,
                matrix: new glib.Matrix(),
                pickMatrix: new glib.Matrix(),
                globalMatrix: new glib.Matrix(),
                mouseCapture: false,
                touchCapture: false,
                parent: null,
                enabled: true,
                closed: false,
                modal: false,
                children: []
            };
        },

        //////////////////////////////////////////////////////////////////////
        // override these...

        onKeyDown: function(keyEvent) {

        },

        //////////////////////////////////////////////////////////////////////

        onKeyUp: function(keyEvent) {

        },

        //////////////////////////////////////////////////////////////////////

        onMouseEnter: function (e) {
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        onTouchEnter: function (e) {
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        onTouchLeave: function (e) {
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        onTouchStart: function (e) {
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        onTouchEnd: function (e) {
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        onTouchMove: function (e) {
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        onMouseLeave: function (e) {
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        onLeftMouseDown: function (e) {
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        onLeftMouseUp: function (e) {
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        onRightMouseDown: function (e) {
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        onRightMouseUp: function (e) {
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        onMouseMove: function (e) {
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        onDraw: function (context) {
            return;
        },

        //////////////////////////////////////////////////////////////////////

        onUpdate: function (time, deltaTime) {
            return;
        },

        //////////////////////////////////////////////////////////////////////

        onClosed: function () {
            return;
        },

        //////////////////////////////////////////////////////////////////////

        onLoaded: function (loader) {
            return;
        },

        //////////////////////////////////////////////////////////////////////

        processMessage: function (e, mouseCapture, touchCapture) {
            var self = this.drawableData,
                c,
                i,
                l,
                pick = false,
                tl,
                br,
                colour;
            // kids get first dibs, and are processed front to back
            if (this.enabled) {
                mouseCapture = mouseCapture || self.mouseCapture;
                touchCapture = touchCapture || self.touchCapture;
                for (i = self.children.length - 1; i >= 0; --i) {
                    c = self.children[i];
                    if (c.processMessage(e, mouseCapture, touchCapture) || c.modal) {
                        return true;
                    }
                }
                if (this.visible && this.enabled) {

                    // tl = self.globalMatrix.apply({ x: 0, y: 0 });
                    // br = self.globalMatrix.apply({ x: this.width, y: this.height });
                    if (e.position !== undefined) {
                        pick = this.pick(e.position, 0);                           // message over the drawable?
                        // if (pick) {
                        //     var color = "black";
                        //     if (Math.random() > 0.333) {
                        //         color = "red";
                        //     } else if(Math.random() > 0.666) {
                        //         color = "white";
                        //     }
                        //     glib.Debug.line(tl.x, tl.y, br.x, tl.y, color);
                        //     glib.Debug.line(tl.x, br.y, br.x, br.y, color);
                        //     glib.Debug.line(tl.x, tl.y, tl.x, br.y, color);
                        //     glib.Debug.line(br.x, tl.y, br.x, br.y, color);
                        // }
                    }

                    switch (e.type) {

                    case glib.Message.touchStart:
                        if(pick || self.touchCapture) {
                            self.isTouched = true;
                            this.dispatchEvent('touchStart', e);
                            return this.onTouchStart(e);
                        }
                        break;

                    case glib.Message.touchEnd:
                        this.dispatchEvent('touchEnd');
                        self.isTouched = false;
                        return this.onTouchEnd(e) && false;

                    case glib.Message.leftMouseDown:
                        if(pick || self.mouseCapture) {
                            this.dispatchEvent('leftMouseDown', e);
                            return this.onLeftMouseDown(e);
                        }
                        break;

                    case glib.Message.rightMouseDown:
                        if(pick || self.mouseCapture) {
                            this.dispatchEvent('rightMouseDown', e);
                            return this.onRightMouseDown(e);
                        }
                        break;

                    case glib.Message.leftMouseUp:
                        if(pick || self.mouseCapture) {
                            this.dispatchEvent('leftMouseUp', e);
                            return this.onLeftMouseUp(e);
                        }
                        break;

                    case glib.Message.rightMouseUp:
                        if(pick || self.mouseCapture) {
                            this.dispatchEvent('rightMouseUp', e);
                            return this.onRightMouseUp(e);
                        }
                        break;

                    case glib.Message.mouseMove:
                        if(pick || self.mouseCapture) {
                            if(!self.mouseIsOver && pick) {
                                // glib.Debug.poly([tl, {x: br.x, y: tl.y}, br, {x: tl.x, y: br.y}], "magenta");
                                this.onMouseEnter(e);
                                this.dispatchEvent('mouseEnter', e);
                            }
                            this.dispatchEvent('mouseMove', e);
                            self.mouseIsOver = pick;
                            return this.onMouseMove(e);
                        } else if(self.mouseIsOver && !pick) {
                            this.dispatchEvent('mouseLeave', e);
                            // glib.Debug.poly([tl, {x: br.x, y: tl.y}, br, {x: tl.x, y: br.y}], "cyan");
                            self.mouseIsOver = false;
                            return this.onMouseLeave(e);
                        }
                        break;

                    case glib.Message.touchMove:
                        if(pick || self.touchCapture) {
                            if(!self.isTouched && pick) {
                                this.dispatchEvent('touchEnter', e);
                            }
                            self.isTouched = true;
                            this.dispatchEvent('touchMove', e);
                            return this.onTouchMove(e);
                        } else if(self.isTouched && !pick) {
                            self.isTouched = false;
                            this.dispatchEvent('touchLeave', e);
                            return this.onTouchLeave(e);
                        }
                        break;

                    case glib.Message.keyDown:
                        this.dispatchEvent('keyDown', e);
                        this.onKeyDown(e);
                        break;

                    case glib.Message.keyUp:
                        this.dispatchEvent('keyUp', e);
                        this.onKeyUp(e);
                        break;
                    }
                }
            }
            return false;
        },

        //////////////////////////////////////////////////////////////////////

        loaded: function (loader) {
            var self = this.drawableData,
                c,
                i,
                l;
            this.dispatchEvent('loaded');
            this.onLoaded(loader);
            for (i = 0, l = self.children.length; i < l; ++i) {
                c = self.children[i];
                c.loaded(loader);
            }
        },

        //////////////////////////////////////////////////////////////////////

        update: function (time, deltaTime) {
            var self = this.drawableData,
                c,
                i,
                l,
                n,
                r,
                frozen = false;
            for (i = 0; i < self.children.length; ++i) {
                c = self.children[i];
                if (c.drawableData.closed) {
                    c.dispatchEvent('closed');
                    c.onClosed();
                    c.drawableData.closed = false;
                    self.children.splice(i, 1);
                }
            }
            if (self.enabled) {
                for (i = self.children.length - 1; i >= 0; --i) {
                    c = self.children[i];
                    c.update(time, deltaTime);
                    if (c.drawableData.modal && !frozen) {
                        glib.Mouse.freeze();
                        glib.Keyboard.freeze();
                        frozen = true;
                    }
                }
                if (self.enabled) {                 // children might disable their parent
                    this.onUpdate(time, deltaTime);
                }
            }
            if (frozen) {
                glib.Mouse.unfreeze();
                glib.Keyboard.unfreeze();
            }
        },

        //////////////////////////////////////////////////////////////////////

        draw: function (context, matrix, transparency) {
            var self = this.drawableData,
                c,
                i,
                l,
                tr;
            if (self.visible) {
                if (self.reorder) {
                    for (i = 0, l = self.children.length; i < l; ++i) {
                        self.children[i].drawableData.baseZindex = i;
                    }
                    self.children.sort(function (a, b) {
                        var d = a.drawableData.myZindex - b.drawableData.myZindex;
                        if (d !== 0) {
                            return d;
                        }
                        return a.drawableData.baseZindex - b.drawableData.baseZindex;
                    });
                    self.reorder = false;
                }
                matrix.multiplyInto(this.drawMatrix(), self.globalMatrix);
                self.globalMatrix.invert(self.pickMatrix);
                self.globalMatrix.setContextTransform(context);
                tr = (transparency * self.transparency) / 255;
                context.globalAlpha = tr / 255;
                if(this.onDraw(context) !== false) {
                    for (i = 0, l = self.children.length; i < l; ++i) {
                        self.children[i].draw(context, self.globalMatrix, tr);
                    }
                }
            }
        },

        //////////////////////////////////////////////////////////////////////

        debug: function () {
            var self = this.drawableData,
                c,
                i,
                l;
            glib.Debug.text(self.matrix.m[4], self.matrix.m[5], self.dirty);
            for (i = 0, l = self.children.length; i < l; ++i) {
                c = self.children[i];
                c.item.debug();
            }
        },

        //////////////////////////////////////////////////////////////////////

        setPivot: function (x, y) {
            this.drawableData.pivot.x = x;
            this.drawableData.pivot.y = y;
            this.drawableData.dirty = true;
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        setRotation: function (radians) {
            this.drawableData.rotation = radians;
            this.drawableData.dirty = true;
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        setPosition: function (x, y) {
            this.drawableData.position.x = x;
            this.drawableData.position.y = y;
            this.drawableData.dirty = true;
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        move: function (x, y) {
            this.drawableData.position.x += x;
            this.drawableData.position.y += y;
            this.drawableData.dirty = true;
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        setScale: function (x, y) {
            this.drawableData.scale.x = x;
            this.drawableData.scale.y = (y !== undefined) ? y : x;
            this.drawableData.dirty = true;
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        setFlip: function (horiz, vert) {
            this.drawableData.drawScale.x = horiz ? -1 : 1;
            this.drawableData.drawScale.y = vert ? -1 : 1;
            this.drawableData.dirty = true;
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        refreshMatrix: function () {
            var self = this.drawableData,
                p,
                s;
            p = { x: -self.pivot.x * this.width, y: -self.pivot.y * this.height };
            s = { x: self.scale.x * self.drawScale.x, y: self.scale.y * self.drawScale.y };
            self.matrix.setIdentity().translate(self.position).rotate(self.rotation).scale(s).translate(p);
            self.dirty = false;
        },

        //////////////////////////////////////////////////////////////////////

        setCapture: function (f) {
            this.drawableData.mouseCapture = f;
            this.drawableData.touchCapture = f;
        },

        //////////////////////////////////////////////////////////////////////
        // not sure this handles rotation with non-zero pivot...

        screenToClient: function (p) {
            var self = this.drawableData;
            return self.pickMatrix.apply(p);
        },

        //////////////////////////////////////////////////////////////////////

        clientToScreen: function (p) {
            var self = this.drawableData;
            return self.globalMatrix.apply(p);
        },

        //////////////////////////////////////////////////////////////////////

        drawMatrix: function () {
            var self = this.drawableData;
            if (self.dirty) {
                this.refreshMatrix();
            }
            return self.matrix;
        },

        //////////////////////////////////////////////////////////////////////

        pick: function (point) {
            var p = this.screenToClient(point);
            return p.x >= 0 && p.y >= 0 && p.x < this.width && p.y < this.height;
        },

        //////////////////////////////////////////////////////////////////////

        removeChild: function (c) {
            var i = this.drawableData.children.indexOf(c);
            if (i !== -1) {
                c.drawableData.parent = null;
                this.drawableData.children.splice(i, 1);
            }
        },

        //////////////////////////////////////////////////////////////////////

        removeChildren: function () {
            var self = this.drawableData,
                child;
            while (self.children.length > 0) {
                child = self.children.shift();
                child.drawableData.parent = null;
            }
        },

        //////////////////////////////////////////////////////////////////////

        addChild: function (c) {
            var self = this.drawableData;
            c.drawableData.parent = this;
            self.children.push(c);
            self.reorder = true;
        },

        //////////////////////////////////////////////////////////////////////

        addSibling: function (c) {
            this.drawableData.parent.addChild(c);
        },

        //////////////////////////////////////////////////////////////////////

        close: function () {
            this.dispatchEvent("closing");
            this.drawableData.closed = true;
        },

        //////////////////////////////////////////////////////////////////////

        getScreenExtent: function () {
            var i,
                min,
                max,
                e = this.drawableData.extent,
                points = [
                        { x: e.left, y: e.top },
                        { x: e.right, y: e.top },
                        { x: e.right, y: e.bottom },
                        { x: e.left, y: e.bottom }
                    ];
            this.drawableData.globalMatrix.transform(points);
            min = { x: points[0].x, y: point[0].y };
            max = { x: points[0].x, y: point[0].y };
            for (i = 1; i < 4; ++i) {
                min.x = Math.min(min.x, points[i].x);
                min.y = Math.min(min.y, points[i].y);
                max.x = Math.max(max.x, points[i].x);
                max.y = Math.max(max.y, points[i].y);
            }
            return { left: min.x, top: min.y, right: max.x, bottom: max.y };
        },

        //////////////////////////////////////////////////////////////////////

        rotation: glib.Property({
            get: function () {
                return this.drawableData.rotation;
            },
            set: function (r) {
                this.drawableData.rotation = r;
                this.drawableData.dirty = true;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        position: glib.Property({
            get: function () {
                return this.drawableData.position;
            },
            set: function (s) {
                this.drawableData.position.x = s.x;
                this.drawableData.position.y = s.y;
                this.drawableData.dirty = true;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        x: glib.Property({
            get: function () {
                return this.drawableData.position.x;
            },
            set: function (x) {
                this.drawableData.position.x = x;
                this.drawableData.dirty = true;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        y: glib.Property({
            get: function () {
                return this.drawableData.position.y;
            },
            set: function (y) {
                this.drawableData.position.y = y;
                this.drawableData.dirty = true;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        size: glib.Property({
            get: function () {
                return this.drawableData.dimensions;
            },
            set: function (s) {
                this.drawableData.dimensions.width = s.width;
                this.drawableData.dimensions.height = s.height;
                this.drawableData.dirty = true;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        width: glib.Property({
            configurable: true,
            get: function () {
                return this.drawableData.dimensions.width;
            },
            set: function (w) {
                this.drawableData.dimensions.width = w;
                this.drawableData.dirty = true;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        height: glib.Property({
            configurable: true,
            get: function () {
                return this.drawableData.dimensions.height;
            },
            set: function (h) {
                this.drawableData.dimensions.height = h;
                this.drawableData.dirty = true;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        scale: glib.Property({
            get: function () {
                return this.drawableData.scale;
            },
            set: function (s) {
                this.drawableData.scale.x = s.x;
                this.drawableData.scale.y = s.y;
                this.drawableData.dirty = true;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        zIndex: glib.Property({
            set: function (z) {
                var self = this.drawableData;
                self.myZindex = z;
                if (self.parent !== null) {
                    self.parent.drawableData.reorder = true;
                }
            },
            get: function () {
                return this.drawableData.myZindex;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        parent: glib.Property({
            get: function () {
                return this.drawableData.parent;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        enabled: glib.Property({
            get: function () {
                return this.drawableData.enabled;
            },
            set: function (e) {
                this.drawableData.enabled = e;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        visible: glib.Property({
            set: function (v) {
                this.drawableData.visible = v;
            },
            get: function () {
                return this.drawableData.visible;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        transparency: glib.Property({
            set: function (t) {
                this.drawableData.transparency = t;
            },
            get: function () {
                return this.drawableData.transparency;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        modal: glib.Property({
            set: function (m) {
                this.drawableData.modal = m;
            },
            get: function () {
                return this.drawableData.modal;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        setDirty: function () {
            this.drawableData.dirty = true;
        }

    });

}());
//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var currentTime,
        deltaTime;

    glib.Timer = glib.Class({ inherit$: glib.Drawable,

        static$: {

            init: function () {
                currentTime = window.performance.now();
            },

            update: function () {
                var now = window.performance.now();
                deltaTime = now - currentTime;
                currentTime = now;
            },

            time: glib.Property({
                get: function () {
                    return currentTime;
                }
            }),

            delta: glib.Property({
                get: function () {
                    return deltaTime;
                }
            })
        },

        $: function(initialDelay, repeatDelay, callback, context) {
            glib.Drawable.call(this);
            this.timeout = repeatDelay;
            this.age = initialDelay;
            this.callback = callback;
            this.context = context;
        },

        onUpdate: function(time, deltaTime) {
            this.age -= deltaTime;
            if(this.age <= 0) {
                if(this.timeout) {
                    this.age = this.timeout;
                } else if (this.parent) {
                    this.parent.removeChild(this);
                }
                if (this.callback.call(this.context) === false) {
                    this.parent.removeChild(this);
                }
            }
        }

    });

}());
(function () {
    "use strict";

    // can't deal with size changing yet...

    glib.Composite = glib.Class({

        static$: {
            identityMatrix: new glib.Matrix()
        },

        $: function () {
            this.compositeData = {
                canvas: null,
                dirty: false,
                oldOnDraw: this.onDraw,
                oldDraw: new glib.Matrix(),
                oldPick: new glib.Matrix(),
                oldGlobal: new glib.Matrix(),
                oldTransparency: 0
            };
            this.composable = true;
        },

        composite_compose: function () {
            var context,
                w,
                h,
                dd = this.drawableData,
                self = this.compositeData;
            w = this.width + dd.padding.left + dd.padding.right + 1;
            h = this.height + dd.padding.top + dd.padding.bottom + 1;
            if(self.canvas === null || w > self.canvas.width || h > self.canvas.height) {
                if(self.canvas !== null) {
                    self.canvas.destroy();
                }
                self.canvas = glib.Canvas.create(w, h);
            } else {
                // console.log("Canvas size didn't change...");
                self.canvas.clear();
            }
            this.oldTransparency = dd.transparency;
            this.drawMatrix().copyTo(self.oldDraw);
            dd.pickMatrix.copyTo(self.oldPick);
            dd.globalMatrix.copyTo(self.oldGlobal);
            dd.matrix.setIdentity();
            this.transparency = 255;
            this.onDraw = self.oldOnDraw;
            glib.Composite.identityMatrix.translation = { x: dd.padding.left, y: dd.padding.top };
            this.draw(self.canvas.context, glib.Composite.identityMatrix, 255);
            this.onDraw = this.composite_draw;
            dd.transparency = this.oldTransparency;
            this.drawMatrix().copyFrom(self.oldDraw);
            dd.pickMatrix.copyFrom(self.oldPick);
            dd.globalMatrix.copyFrom(self.oldGlobal);
            self.dirty = false;
        },

        composite_draw: function (context) {
            var cd = this.compositeData,
                dd = this.drawableData;
            if(cd.dirty) {
                this.composite_compose();
            }
            context.drawImage(cd.canvas.canvas, -dd.padding.left, -dd.padding.top); // draw at -extent.left, -extent.top
            return false;   // don't draw the children...
        },

        compose: function () {
            var cd = this.compositeData;
            cd.dirty = true;
            if(this.composable) {
                this.onDraw = this.composite_draw;
            }
        },

        decompose: function () {
            this.onDraw = this.compositeData.oldOnDraw;
        }
    });

} ());//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Cache = glib.Class({

            static$: {

                items: {},

                get: function(name) {
                    // console.log("Got " + name + "? " + (Cache.items[name] === undefined ? "no" : "yes"));
                    if (Cache.items[name] !== undefined) {
                        return Cache.items[name].object;
                    }
                    return undefined;
                },

                put: function(name, object, size) {
                    // console.log("Adding " + name);
                    Cache.items[name] = { object: object, size: size };
                },

                dump: function() {
                    var i;
                    console.log("{");
                    for(i in Cache.items) {
                        console.log("\t\"" + i + "\": " + Cache.items[i].size.toString() + ",");
                    }
                    console.log("}");
                }
            }
        }),

    //////////////////////////////////////////////////////////////////////

        brokenImageGif = "R0lGODlhHAAeAKIAAMDAwICAgKyomfHv4v8AAAAAAP///wAAACH5BAAAAAAALAAAAAAcAB4AA" +
                            "AOAKLrc7kOYSau9NuLNp+5g9YXhSHbmuaVG4L4wfLEBCBSzZNXdnV88ji+jqwQ3Q1GREiQQJs5" +
                            "JkkKrOKNSHBFowWZ/O+uVMvUsJ82nAVs2VHtaJRcONtri1HPrXmcC/oCBf3hmFwWHiImJfSoYL" +
                            "I1ykCt6koWVjJduA5ucnZ6foAkAOw==",

        Item = glib.Class({ inherit$: glib.EventSource,

            $: function (url, data, loader, forceFileType) {
                var extension;
                glib.EventSource.call(this);
                this.url = url;
                this.size = null;
                this.bytesReceived = 0;
                this.data = data;
                this.loaded = false;
                this.loader = loader;
                this.inProgress = false;
                this.binary = undefined;
                this.started = false;
                if (forceFileType === undefined) {
                    extension = glib.Util.getExtension(url);
                } else {
                    extension = forceFileType;
                }
                switch (extension) {
                case 'jpg':
                case 'jpeg':
                    this.object = new Image();
                    this.binary = true;
                    this.finalize = Item.processJPEG;
                    break;
                case 'png':
                    this.object = new Image();
                    this.binary = true;
                    this.finalize = Item.processImage;
                    break;
                case 'json':
                    this.object = {};
                    this.binary = false;
                    this.finalize = Item.processJSON;
                    break;
                //case xml:
                //case bin:
                default:
                    this.object = new Uint8Array();
                    this.binary = true;
                    this.finalize = Item.processBinary;
                    break;
                }
            },

            load: function () {
                var e;
                if (!this.started) {
                    this.started = true;
                    e = Cache.get(this.url);
                    if(e !== undefined) {
                        this.inProgress = true;
                        this.loaded = true;
                        this.object = e;
                        this.doCallback();
                    } else {
                        glib.ajax.get(this.url, Item.onLoaded, Item.onProgress, this, this.binary);
                    }
                }
            },

            doCallback: function () {
                this.dispatchEvent("loaded", this.object);
            },

            then: function (c, f) {
                if (this.loaded) {
                    f.call(c, this.object);
                } else {
                    this.addEventHandler("loaded", f, c, true);
                }
            },

            static$: {

                onProgress: function (url, e) {
                    this.inProgress = true;
                    if (e.lengthComputable && this.size === null) {
                        this.size = e.total;
                    }
                    this.bytesReceived = e.loaded;
                },

                onLoaded: function (url, xr) {
                    var data = null,
                        process = null,
                        status = xr.status,
                        contentType = xr.getResponseHeader('Content-Type');
                    if(status == 200) {
                        switch(contentType) {
                            case 'image/png':
                                data = glib.Util.getResponseAsArray(xr);
                                process = Item.processImage;
                                break;
                            case 'image/jpeg':
                                data = glib.Util.getResponseAsArray(xr);
                                process = Item.processJPEG;
                                break;
                            case 'text/plain':
                            case 'application/json':
                                data = xr.responseText;
                                process = Item.processJSON;
                                break;
                            default:
                                console.log("Unknown Content-Type: " + contentType);
                                data = xr.responseText;
                                process = Item.processText;
                                break;
                        }
                    } else {
                        // some error...
                        // check extension of url and maybe give them something
                    }
                    if(process !== null && data !== null) {
                        process.call(this, data);
                        Cache.put(this.url, this.object, data.length);
                    }
                    this.inProgress = true;
                    this.loaded = true;
                    this.doCallback();
                },

                processImage: function (data) {
                    if (data) {
                        this.object.src = 'data:image/png;base64,' + glib.Util.btoa(data);
                    } else {
                        this.object.src = 'data:image/gif;base64,' + brokenImageGif;
                    }
                },

                processJPEG: function (data) {
                    if (data) {
                        this.object.src = 'data:image/jpeg;base64,' + glib.Util.btoa(data);
                    } else {
                        this.object.src = 'data:image/gif;base64,' + brokenImageGif;
                    }
                },

                processJSON: function (data) {
                    var o;
                    if (data) {
                        try {
                            o = JSON.parse(data);
                            glib.Util.shallowCopy(o, this.object);    // fuckit
                        } catch(e) {
                            // almost certainly an error in the data
                        }
                    } else {
                    }
                },

                processText: function (data) {
                },

                processBinary: function (data) {
                    if (data) {
                        this.object.set(data, 0);
                    }
                }
            }
        });

    //////////////////////////////////////////////////////////////////////

    glib.Loader = glib.Class({ inherit$: [glib.Drawable, glib.EventSource],

        //////////////////////////////////////////////////////////////////////

        static$: {

            dumpCacheManifest: function () {
                Cache.dump();
            }
        },

        $: function (baseDir) {
            glib.Drawable.call(this);
            glib.EventSource.call(this);
            this.baseDir = baseDir || "";
            this.items = {};
        },

        //////////////////////////////////////////////////////////////////////

        percentComplete: function () {
            var i,
                total = 0,
                received = 0;
            for (i in this.items) {
                if (this.items[i].size !== undefined) {
                    total += this.items[i].size;
                }
                received += this.items[i].bytesReceived;
            }
            total = total || received;
            return (received > 0) ? received * 100 / total : 0;
        },

        //////////////////////////////////////////////////////////////////////

        complete: function () {
            var i;
            for (i in this.items) {
                if (!this.items[i].loaded) {
                    return false;
                }
            }
            return true;
        },

        //////////////////////////////////////////////////////////////////////
        // use debug output for now...

        onUpdate: function () {
            var i,
                item,
                s;
            glib.Debug.print("Loading, " + this.percentComplete().toFixed(0) + "% complete...");
            glib.Debug.print();
            for (i in this.items) {
                item = this.items[i];
                s = item.bytesReceived.toString();
                while (s.length < 20) {
                    s = " " + s;
                }
                glib.Debug.print(s + ": " + item.url);
            }
        },

        //////////////////////////////////////////////////////////////////////

        reset: function (baseDir) {
            this.baseDir = baseDir || this.baseDir;
            this.items = {};
        },

        //////////////////////////////////////////////////////////////////////

        start: function () {
            var i;
            for (i in this.items) {
                this.items[i].load();
            }
        },

        //////////////////////////////////////////////////////////////////////

        itemLoaded: function (item) {
            if (this.complete()) {
                if (this.parent !== null) {
                    this.parent.loaded(this);
                }
                this.dispatchEvent("complete");
            }
        },

        //////////////////////////////////////////////////////////////////////

        loadItem: function (name, callback, context, data) {
            var url = glib.ajax.url(this.baseDir + name, data),
                item = this.items[url];
            if (item === undefined) {
                item = new Item(url, data, this);
                this.items[url] = item;
            }
            item.load();
            return item;
        },

        //////////////////////////////////////////////////////////////////////

        load: function (name, callback, context, data, forceFileType) {
            var url = glib.ajax.url(this.baseDir + name, data),
                item = this.items[url];
            if (item === undefined) {
                item = new Item(url, data, this, forceFileType);
                this.items[url] = item;
            }
            if (callback) {
                item.addEventHandler("loaded", callback, context);
            }
            item.addEventHandler("loaded", this.itemLoaded, this);
            return item.object;
        },

    });

}());
//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    glib.Image = glib.Class({ inherit$: glib.Drawable,

        $: function (url) {
            var that = this;
            glib.Drawable.call(this);
            this.loaded = false;
            this.image = new Image();
            this.image.onload = function () {
                that.size = { width: that.image.width, height: that.image.height };
                that.loaded = true;
                that.dispatchEvent("loaded");
                that.onDraw = that.realOnDraw;
            };
            if(url) {
                this.image.src = url;
            }
        },

        scaleTo: function (x, y) {
            this.setScale(x / this.width, y / this.height);
            return this;
        },

        src: glib.Property({
            set: function (s) {
                this.image.src = s;
            }
        }),

        onDraw: function (context) {
        },

        realOnDraw: function (context) {
            var w = this.width,
                h = this.height;
            context.drawImage(this.image, 0, 0, w, h, 0, 0, w, h);
        }
    });

}());//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    glib.Sprite = glib.Class({ inherit$: glib.Drawable,

        $: function (image) {

            glib.Drawable.call(this);
            this.image = image;
            this.UV = { x: 0, y: 0 };
            this.framesWide = 1;
            this.framesHigh = 1;
            this.frameWidth = null;
            this.frameHeight = null;
            this.frame = 0;
        },

        static$: {

            load: function (name, loader) {
                return new glib.Sprite(loader.load(name + ".png"));
            }
        },

        setFrameXY: function (x, y) {
            this.UV.x = x * this.frameWidth;
            this.UV.y = y * this.frameHeight;
        },

        setFrame: function (frame) {
            this.setFrameXY((frame % this.framesWide) >>> 0, (frame / this.framesWide) >>> 0);
        },

        width: glib.Property({
            get: function () {
                return this.frameWidth || this.image.width;
            }
        }),

        height: glib.Property({
            get: function () {
                return this.frameHeight || this.image.height;
            }
        }),

        size: glib.Property({
            get: function () {
                return { width: this.width, height: this.height };
            }
        }),

        scaleTo: function (x, y) {
            this.setScale(x / this.width, y / this.height);
            return this;
        },

        onDraw: function (context, matrix) {
            var w = this.width,
                h = this.height;
            context.drawImage(this.image, this.UV.x, this.UV.y, w, h, 0, 0, w, h);
        }
    });

}());

//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    glib.Button = glib.Class({ inherit$: glib.EventSource,

        static$: {
            idle: 0,
            hover: 1,
            pressed: 2
        },

        $: function (click, context) {
            this.currentState = glib.Button.idle;
            this.callback = click;
            this.context = context || this;
        },

        onHover: function () {
        },

        onIdle: function () {
        },

        onPressed: function () {
        },

        onClicked: function () {
        },

        onTouchStart: function () {
            this.state = glib.Button.pressed;
            return true;
        },

        onTouchEnd: function (e) {
            if(this.state === glib.Button.pressed) {
                this.state = glib.Button.idle;
                this.dispatchEvent("clicked", this);
                if (this.callback) {
                    this.callback.call(this.context || this);
                }
            }
            return true;
        },

        onTouchEnter: function () {
            return true;
        },

        onTouchLeave: function () {
            this.state = glib.Button.idle;
            return true;
        },

        onMouseEnter: function () {
            this.state = glib.Button.hover;
            return true;
        },

        onMouseLeave: function () {
            this.state = glib.Button.idle;
            return true;
        },

        onLeftMouseDown: function () {
            this.state = glib.Button.pressed;
            return true;
        },

        onLeftMouseUp: function () {
            if (this.state === glib.Button.pressed) {
                this.state = glib.Button.hover;
                this.onClicked();
                this.dispatchEvent("clicked");
                if (this.callback) {
                    this.callback.call(this.context || this);
                }
            }
            return true;
        },

        state: glib.Property({
            get: function () {
                return this.currentState;
            },
            set: function (s) {
                if(this.currentState != s) {
                    this.currentState = s;
                    switch (s) {
                    case glib.Button.idle:
                        this.dispatchEvent("idle");
                        this.onIdle();
                        break;
                    case glib.Button.hover:
                        this.dispatchEvent("hover");
                        this.onHover();
                        break;
                    case glib.Button.pressed:
                        this.dispatchEvent("pressed");
                        this.onPressed();
                        break;
                    }
                }
            }
        })
    });

}());
//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    glib.Rectangle = glib.Class({ inherit$: glib.Drawable,

        $: function (x, y, w, h, radius) {
            glib.Drawable.call(this);
            this.setPosition(x, y);
            this.size = { width: w, height: h };
            this.radius = (radius !== none) ? radius : 0;
        },

        onDraw: function (context) {
            if(this.radius > 0) {
                glib.Util.roundRect(context, 0, 0, this.width, this.height, this.radius);
            } else {
                glib.Util.rect(context, 0, 0, this.width, this.height);
            }
        }
    });

    //////////////////////////////////////////////////////////////////////

    glib.ClipRect = glib.Class({ inherit$: glib.Rectangle,

        $: function (x, y, w, h, radius) {
            glib.Rectangle.call(this, x, y, w, h, radius);
        },

        onDraw: function (context) {
            glib.Rectangle.prototype.onDraw.call(this, context);
            context.clip();
        }
    });

    //////////////////////////////////////////////////////////////////////

    glib.SolidRectangle = glib.Class({ inherit$: glib.Rectangle,

        $: function (x, y, w, h, radius, fillColour) {
            glib.Rectangle.call(this, x, y, w, h, radius);
            this.fillColour = fillColour;
        },

        drawIt: function (context) {
            context.fillStyle = this.fillColour;
            context.fill();
        },

        onDraw: function (context) {
            glib.Rectangle.prototype.onDraw.call(this, context);
            this.drawIt(context);
        }
    });

    //////////////////////////////////////////////////////////////////////

    glib.OutlineRectangle = glib.Class({ inherit$: glib.Rectangle,

        $: function (x, y, w, h, radius, lineColour, lineWidth) {
            glib.Rectangle.call(this, x, y, w, h, radius);
            this.lineColour = lineColour;
            this.lineWidth = lineWidth === undefined ? 1 : lineWidth;
        },

        drawIt: function (context) {
            context.lineWidth = this.lineWidth;
            context.strokeStyle = this.lineColour;
            context.stroke();
        },

        onDraw: function (context) {
            glib.Rectangle.prototype.onDraw.call(this, context);
            this.drawIt(context);
        }
    });

    //////////////////////////////////////////////////////////////////////

    glib.Panel = glib.Class({ inherit$: glib.Rectangle,

        $: function (x, y, w, h, fillColour, lineColour, radius, lineWidth) {
            glib.Rectangle.call(this, x, y, w, h, radius);
            this.fillColour = fillColour;
            this.lineColour = lineColour;
            this.lineWidth = lineWidth || 1;
        },

        onDraw: function (context) {
            glib.Rectangle.prototype.onDraw.call(this, context);
            if (this.fillColour !== undefined) {
                glib.SolidRectangle.prototype.drawIt.call(this, context);
            }
            if (this.lineColour !== undefined) {
                glib.OutlineRectangle.prototype.drawIt.call(this, context);
            }
        }
    });

    //////////////////////////////////////////////////////////////////////

    glib.Line = glib.Class({ inherit$: glib.Drawable,

        $: function (x1, y1, x2, y2, colour, width) {
            glib.Drawable.call(this);
            this.x1 = x1;
            this.x2 = x2;
            this.y1 = y1;
            this.y2 = y2;
            this.colour = colour;
            this.lineWidth = width;
        },

        onDraw: function (context) {
            context.beginPath();
            context.moveTo(this.x1, this.y1);
            context.lineTo(this.x2, this.y2);
            context.strokeStyle = this.colour;
            context.lineWidth = this.lineWidth;
            context.stroke();
        }
    });

    //////////////////////////////////////////////////////////////////////

    glib.PanelButton = glib.Class({ inherit$: [glib.Button, glib.Composite, glib.Panel],

        $: function (x, y, w, h, fillColour, lineColour, radius, lineWidth, click, context) {
            glib.Button.call(this, click, context);
            glib.Composite.call(this);
            glib.Panel.call(this, x, y, w, h, fillColour, lineColour, radius, lineWidth);
        }
    });

    //////////////////////////////////////////////////////////////////////

    glib.LinkButton = glib.Class({ inherit$: [glib.Button, glib.Line],

        $: function (x1, y1, x2, y2, link, click, context) {
            var l = Math.floor(x1) + 0.5,
                r = Math.floor(x2) + 0.5,
                t = Math.floor(y1) + 0.5,
                b = Math.floor(y2) + 0.5,
                h = b - t,
                w = r - l;
            glib.Line.call(this, 0, h, w, h, "skyblue", 2);
            glib.Button.call(this, function () {
                if (this.linkClicked) {
                    this.linkClicked.call(this.clickContext, this.link);
                }
            }, this);
            this.clickContext = context;
            this.link = link;
            this.linkClicked = click;
            this.setPosition(l, t);
            this.size = { width: w, height: h };
        },
        onIdle: function () { this.colour = "skyblue"; },
        onHover: function () { this.colour = "red"; },
        onPressed: function () { this.colour = "white"; }
    });

}());//////////////////////////////////////////////////////////////////////
(function () {
    "use strict";

    var measureText = function () {
        var self = this.labelData,
            p = this.drawableData.padding;
        self.extent = this.labelData.font.measureText(this.labelData.text);
        this.size = { width: self.extent.width, height: self.extent.height };
        p.left = -self.extent.left;
        p.top = -self.extent.top;
        p.right = self.extent.right - self.extent.width;
        p.bottom = self.extent.bottom - self.extent.height;
    };

    glib.Label = glib.Class({ inherit$: [glib.Composite, glib.Drawable],

        $: function (text, font) {
            glib.Drawable.call(this);
            glib.Composite.call(this);
            this.labelData = {
                text: text,
                font: font,
                extent: null
            };
            measureText.call(this);
            this.compose();
        },

        text: glib.Property({
            configurable: true,
            get: function () {
                return this.labelData.text;
            },
            set: function (s) {
                if (this.labelData.text !== s) {
                    this.labelData.text = s;
                    measureText.call(this);
                    this.compose();
                }
            }
        }),

        font: glib.Property({
            get: function () {
                return this.labelData.font;
            },
            set: function (f) {
                if (this.labelData.font !== f) {
                    this.labelData.font = f;
                    measureText.call(this);
                    this.compose();
                }
            }
        }),

        onDraw: function (context) {
            var self = this.labelData;
            self.font.renderString(context, self.text, 0.5, 0.5);
        }

    });

    var linkClickedCallback = function (link) {
        if (this.linkClicked !== undefined) {
            this.linkClicked.call(this.context, link);
        }
    };

    glib.TextBox = glib.Class({ inherit$: glib.ClipRect,

        $: function (x, y, w, h, text, font, lineBreak, linkClicked, context) {
            glib.ClipRect.call(this, x, y, w, h, 0);
            if (linkClicked) {
                this.links = new glib.Drawable();
                this.addChild(this.links);
            }
            this.label = new glib.Label(text, font);
            this.addChild(this.label);
            this.context = context;
            this.setPosition(x, y);
            this.linkClicked = linkClicked;
            this.lineBreak = lineBreak || '\r';
            this.text = text;
        },

        text: glib.Property({
            set: function (s) {
                var links = [],
                    link;
                this.label.text = this.label.font.wrapText(s, this.width, this.lineBreak);
                if (this.linkClicked) {
                    this.label.font.measureText(this.label.text, links);
                    this.links.removeChildren();
                    while (links.length > 0) {
                        link = new glib.LinkButton(links.shift(),
                            links.shift(),
                            links.shift(),
                            links.shift(),
                            links.shift(),
                            linkClickedCallback,
                            this);
                        link.transparency = 192;
                        this.links.addChild(link);
                    }
                }
            },
            get: function (s) {
                return this.label.text;
            }
        })
    });

}());

//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    glib.Font = glib.Class({

        //////////////////////////////////////////////////////////////////////

        static$: {

            load: function (name, loader) {
                return new glib.Font(loader.load(name + ".json"), loader.load(name + "0.png"));
            }
        },

        //////////////////////////////////////////////////////////////////////

        $: function (font, page) {
            this.page = page;
            this.font = font;
            this.lineSpacing = 0;
            this.softLineSpacing = 0;
            this.letterSpacing = 0;
            this.mask = 0xff;
        },

        //////////////////////////////////////////////////////////////////////

        midPivot: glib.Property ({
            get: function () {
                return this.font.baseline / this.font.height / 2;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        baselinePivot: glib.Property ({
            get: function () {
                return this.font.baseline / this.font.height;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        height: glib.Property({
            get: function () {
                return this.font.height;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        baseline: glib.Property({
            get: function () {
                return this.font.baseline;
            }
        }),

        //////////////////////////////////////////////////////////////////////

        renderString: function (ctx, str, x, y) {
            var l,
                i,
                layer,
                xc,
                yc,
                c,
                s,
                glyph,
                inLink = false,
                escape = false,
                skip = false,
                ls = this.lineSpacing,
                sls = this.softLineSpacing;
            for (l = 0; l < this.font.layerCount; ++l) {
                if ((1 << l) & this.mask) {
                    layer = this.font.Layers[l];
                    xc = x + layer.offsetX;
                    yc = y + layer.offsetY;
                    for (i = 0; i < str.length; ++i) {
                        c = str[i];
                        if (!escape) {
                            switch (c) {
                            case '\n':
                                xc = layer.offsetX;
                                yc += this.font.height + ls;
                                skip = true;
                                break;
                            case '\r':
                                xc = layer.offsetX;
                                yc += this.font.height + sls;
                                skip = true;
                                break;
                            case '\\':
                                escape = true;
                                skip = true;
                                break;
                            case '@':
                                inLink = !inLink;
                                skip = true;
                                break;
                            default:
                                skip = false;
                                break;
                            }
                        }
                        if (!skip) {
                            c = this.font.charMap[c.charCodeAt(0)];
                            if (c !== undefined) {
                                glyph = this.font.glyphs[c];
                                if (l < glyph.imageCount) {
                                    s = glyph.images[l];
                                    ctx.drawImage(this.page, s.x, s.y, s.w, s.h, xc + s.offsetX, yc + s.offsetY, s.w, s.h);
                                }
                                xc += glyph.advance;
                            }
                        }
                    }
                }
            }
        },

        //////////////////////////////////////////////////////////////////////
        // just measure the top layer

        measureText: function (str, links, whichLayer) {
            var layerToMeasure = (whichLayer === undefined) ? this.font.layerCount - 1 : whichLayer,
                l,
                layer,
                maxWidth = 0,
                w = 0,
                xc,
                yc,
                i,
                c,
                glyph,
                s,
                inLink = false,
                escape = false,
                skip = false,
                link = "",
                left = 0,
                right = 0,
                top = 0,
                bottom = 0,
                sls = this.softLineSpacing,
                ls = this.lineSpacing;

            if (links) {
                links.length = 0;
            }
            for (l = 0; l < this.font.layerCount; ++l) {
                layer = this.font.Layers[l];
                xc = layer.offsetX;
                yc = layer.offsetY;
                for (i = 0; i < str.length; ++i) {
                    c = str[i];
                    if (!escape) {
                        switch (c) {
                        case '\n':
                            xc = layer.offsetX;
                            yc += this.font.height + ls;
                            skip = true;
                            break;
                        case '\r':
                            xc = layer.offsetX;
                            yc += this.font.height + sls;
                            skip = true;
                            break;
                        case '\\':
                            escape = true;
                            skip = true;
                            break;
                        case '@':
                            inLink = !inLink;
                            skip = true;
                            if (links && l === 0) {
                                if (inLink) {
                                    links.push(xc, yc);
                                } else {
                                    links.push(xc, yc + this.font.baseline + 3, link);
                                    link = "";
                                }
                            }
                            break;
                        default:
                            skip = false;
                            break;
                        }
                    }
                    if (!skip) {
                        if (inLink) {
                            link += c;
                        }
                        c = this.font.charMap[c.charCodeAt(0)];
                        if (c !== undefined) {
                            glyph = this.font.glyphs[c];
                            if (l < glyph.imageCount) {
                                s = glyph.images[l];
                                left = Math.min(s.offsetX + xc, left);
                                right = Math.max(s.offsetX + s.w + xc, right);
                                top = Math.min(s.offsetY + yc, top);
                                bottom = Math.max(s.offsetY + s.h + yc, bottom);
                            }
                            xc += glyph.advance;
                            if (l === layerToMeasure) {
                                maxWidth = Math.max(xc, maxWidth);
                            }
                        }
                    }
                }
            }
            return { width: maxWidth, height: yc + this.font.height, left: left, right: right, top: top, bottom: bottom };
        },

        //////////////////////////////////////////////////////////////////////

        wrapText: function (str, width, lineBreak) {
            var lastGood = 1,
                i,
                newGood,
                newText;
            while (this.measureText(str).width >= width) {
                newGood = -1;
                for (i = lastGood; i < str.length; ++i) {
                    if (str[i] === " ") {
                        newText = str.slice(0, i);
                        if (this.measureText(newText).width >= width) {
                            break;
                        }
                        newGood = i;
                    }
                }
                if (newGood === -1) {
                    break;
                }
                lastGood = newGood;
                if (lastGood >= str.length) {
                    break;
                }
                str = str.slice(0, lastGood) + lineBreak + str.slice(lastGood + 1);
                lastGood += lineBreak.length;
            }
            return str;
        }
    });

}());

//////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////
(function () {
    "use strict";

    glib.TextButton = glib.Class({ inherit$: [glib.Button, glib.Drawable],

        $: function (text, font, x, y, w, h, click, context, radius, outline) {
            var ol = outline === undefined ? true : false;
            glib.Button.call(this, click, context);
            glib.Drawable.call(this);

            this.idleFillColour = 'darkSlateGrey';
            this.hoverFillColour = 'slateGrey';
            this.pressedFillColour = 'lightSlateGrey';

            if (!ol) {
                this.idleLineColour = undefined;
                this.hoverLineColour = undefined;
                this.pressedLineColour = undefined;
            } else {
                this.idleLineColour = 'white';
                this.hoverLineColour = 'white';
                this.pressedLineColour = 'darkSlateGrey';
            }

            this.label = new glib.Label(text, font);
            this.size = { width: Math.max(w, this.label.width + 16), height: h };
            this.setPosition(x, y);
            this.panel = new glib.Panel(0, 0, this.width, h, "darkSlateGrey", this.idleLineColour, radius === undefined ? h / 3 : radius, 3);
            this.addChild(this.panel);
            this.label.setPivot(0.5, font.midPivot);
            this.label.setPosition(this.width / 2, this.height / 2);
            this.addChild(this.label);

        },

        text: glib.Property({
            set: function (t) {
                this.label.text = t;
            },
            get: function () {
                return this.label.text;
            }
        }),

        onHover: function () {
            this.panel.lineColour = this.hoverLineColour;
            this.panel.fillColour = this.hoverFillColour;
        },

        onIdle: function () {
            this.panel.lineColour = this.idleLineColour;
            this.panel.fillColour = this.idleFillColour;
        },

        onPressed: function () {
            this.panel.lineColour = this.pressedLineColour;
            this.panel.fillColour = this.pressedFillColour;
        }
    });

}());
//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    glib.SpriteButton = glib.Class({ inherit$: [glib.Button, glib.Sprite],

        $: function (image, type, x, y, click, context) {
            glib.Button.call(this, click, context);
            glib.Sprite.call(this, image);
            this.setPivot(0.5, 0.5);
            this.type = type;
            this.setPosition(x, y);
            this.origin = { x: x, y: y };
        },

        onIdle: function () {
            switch (this.type) {
            case 'frame':
                this.setFrame(0);
                break;
            case 'offset':
                this.setPosition(this.origin.x, this.origin.y);
                break;
            case 'scale':
                this.setScale(1);
                break;
            }
        },

        onHover: function () {
            switch (this.type) {
            case 'frame':
                this.setFrame(1);
                break;
            case 'offset':
                this.setPosition(this.origin.x - 1, this.origin.y - 1);
                break;
            case 'scale':
                this.setScale(1.25);
                break;
            }
        },

        onPressed: function () {
            switch (this.type) {
            case 'frame':
                this.setFrame(2);
                break;
            case 'offset':
                this.setPosition(this.origin.x + 2, this.origin.y + 2);
                break;
            case 'scale':
                this.setScale(1.5);
                break;
            }
        }
    });

}());
//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    glib.Menu = glib.Class({ inherit$: glib.Drawable,

        // callback can be a function or an array of functions
        $: function (x, y, font, items, callback, context) {
            var i,
                ht = font.height,
                w = 0,
                h,
                yp = 0,
                item,
                clip,
                ftb,
                cb;
            for (i = 0; i < items.length; ++i) {
                item = items[i];
                w = Math.max(w, font.measureText(item).width + 8);
            }
            w += 32;
            h = (font.height + 16) * items.length;
            glib.Drawable.call(this);
            this.setPosition(x, y);
            this.size = { width: w, height: h };
            this.clip = new glib.ClipRect(0, 0, w, h, 6);
            this.addChild(this.clip);
            this.transparency = 224;
            this.font = font;
            this.setPosition(x, y);
            this.buttons = [];
            i = 0;
            items.forEach(function (item) {
                var align = item[0],
                    xpivot = 0.5,
                    ypivot = 0.5,
                    txt;
                if (align !== '<' && align !== '>' && align !== '\\') {
                    txt = item;
                } else {
                    txt = item.slice(1);
                }
                ftb = new glib.TextButton(txt, font, 0, yp, w, font.height + 16, function () {
                    this.state = glib.Button.idle;
                    this.parent.parent.dispatchEvent('chosen');
                    if (Array.isArray(callback)) {
                        cb = callback[this.index % callback.length];
                        if (cb) {
                            cb.call(context, this.index);
                        }
                    } else if (callback) {
                        callback.call(context, this.index);
                    }
                }, null, 0);
                ftb.index = i++;
                ftb.lineColour = "white";
                ftb.lineTransparency = 255;
                ftb.onIdle = function () { this.panel.fillColour = 'black'; this.panel.transparency = 192; };
                ftb.onHover = function () { this.panel.fillColour = 'slategrey'; this.panel.transparency = 255; };
                ftb.onPressed = function () { this.panel.fillColour = 'darkslategrey'; this.panel.transparency = 255; };
                ftb.panel.fillColour = 'black';
                ftb.panel.transparency = 192;
                switch (align) {
                case '<':
                    ftb.label.setPivot(0, font.midPivot);
                    ftb.label.setPosition(8, ftb.height / 2);
                    break;
                case '>':
                    ftb.label.setPivot(1, font.midPivot);
                    ftb.label.setPosition(ftb.width - 8, ftb.height / 2);
                    break;
                }
                this.clip.addChild(ftb);
                yp += font.height + 16;
                this.buttons.push(ftb);
            }, this);
            this.addChild(new glib.OutlineRectangle(0, 0, w, h, 6, "white", 3)); // border
        }
    });

    //////////////////////////////////////////////////////////////////////

    glib.PopupMenu = glib.Class({ inherit$: glib.Menu,

        $: function (x, y, font, items, callback, context) {
            glib.Menu.call(this, x, y, font, items, callback, context);
            this.addEventHandler('chosen', this.close, this);
            this.addEventHandler('leftMouseUp', this.close, this);
            this.modal = true;
            this.setCapture(true);
        }
    });

}());
(function () {
    "use strict";

    glib.Window = glib.Class({ inherit$: glib.Drawable,

        $: function (desc) {
            var hasCloseButton = (desc.closeButton === undefined) ? false : desc.closeButton,
                isDraggable = (desc.draggable === undefined) ? true : desc.draggable,
                radius = desc.cornerRadius || 0,
                bgcol = desc.backgroundColour || "black",
                captionScale = desc.captionScale || 1,
                captionColour = desc.captionColour !== undefined ? desc.captionColour : 'darkslategrey',
                hasBorder = desc.border === undefined ? true : desc.border,
                borderWidth = desc.borderWidth || 2,
                borderColour = desc.borderColor !== undefined ? desc.borderColor : "white",
                hasTitleBar = desc.caption !== undefined,
                titleBarHeight = Math.max(hasTitleBar ? desc.font.height * captionScale + borderWidth * 4 : 0, radius),
                titleBarWidth = desc.width;

            glib.Drawable.call(this);
            this.size = { width: desc.width, height: desc.height };
            this.setPosition(desc.x, desc.y);

            this.panel = new glib.Panel(0, 0, desc.width, desc.height, bgcol, none, radius, 0);
            this.addChild(this.panel);

            if (hasCloseButton) {
                titleBarWidth -= titleBarHeight;
            }

            this.clientOffset = titleBarHeight;

            this.clip = new glib.ClipRect(0, 0, desc.width, desc.height, radius);
            this.client = new glib.ClipRect(0, this.clientOffset, desc.width, desc.height - this.clientOffset);
            this.clip.addChild(this.client);
            this.addChild(this.clip);
            this.border = null;

            if (hasTitleBar) {
                this.titleBar = new glib.Panel(0, 0, titleBarWidth, titleBarHeight, captionColour, none, 0);
                this.titleBar.window = this;
                this.clip.addChild(this.titleBar);
                this.caption = new glib.Label(desc.caption, desc.font).setPosition(radius + borderWidth + 4, titleBarHeight / 2).setScale(captionScale).setPivot(0, desc.font.midPivot);
                this.titleBar.addChild(this.caption);
                if (hasBorder) {
                    this.addChild(new glib.Line(0, titleBarHeight, desc.width, titleBarHeight, borderColour, borderWidth));
                }
            }

            if (hasCloseButton) {
                this.closeButton = new glib.PanelButton(desc.width - titleBarHeight, 0, titleBarHeight, titleBarHeight, "darkred", none, 0, 0, function () { this.close(); }, this);
                this.closeButton.onHover = function () { this.fillColour = "firebrick"; };
                this.closeButton.onIdle = function () { this.fillColour = "darkred"; };
                this.closeButton.onPressed = function () { this.fillColour = "red"; };
                this.closeButton.addChild(new glib.Line(titleBarHeight * 0.25, titleBarHeight * 0.25, titleBarHeight * 0.75, titleBarHeight * 0.75, "white", titleBarHeight / 8));
                this.closeButton.addChild(new glib.Line(titleBarHeight * 0.75, titleBarHeight * 0.25, titleBarHeight * 0.25, titleBarHeight * 0.75, "white", titleBarHeight / 8));
                this.clip.addChild(this.closeButton);
                this.clip.addChild(new glib.Line(titleBarWidth, 0, titleBarWidth, titleBarHeight, borderColour, borderWidth));
            }

            if (borderColour !== undefined) {
                this.border = new glib.Panel(0, 0, desc.width, desc.height, none, borderColour, radius, borderWidth);
                this.addChild(this.border);
            }
            this.client.window = this;
            this.drag = false;
            this.dragOffset = { x: 0, y: 0 };
            this.dragStart = { x: 0, y: 0 };

            if (hasTitleBar && isDraggable) {

                this.titleBar.addEventHandler("leftMouseDown", function (e) {
                    this.drag = true;
                    this.titleBar.setCapture(true);
                    this.dragStart = e.position;
                    this.dragOffset = { x: this.position.x - e.position.x, y: this.position.y - e.position.y };   // screen coordinate!
                }, this);

                this.titleBar.addEventHandler("leftMouseUp", function (e) {
                    this.titleBar.setCapture(false);
                    this.drag = false;
                }, this);

                this.titleBar.addEventHandler("mouseMove", function (e) {
                    var pos,
                        x,
                        y,
                        w,
                        h;
                    if (this.drag) {
                        x = e.position.x + this.dragOffset.x;   // WINDOW DRAG CONTRAINT BROKEN IF TRANSFORM IS MORE THAN SIMPLE TRANSLATION!!!
                        y = e.position.y + this.dragOffset.y;
                        x = glib.Util.constrain(x, -this.width / 4, glib.desktop.width + this.width / 4);
                        y = glib.Util.constrain(y, this.height / 2, glib.desktop.height + this.height / 2 - this.clientOffset);
                        this.setPosition(x, y);
                    }
                }, this);
            }

            if(desc.backgroundTransparency !== undefined) {
                this.panel.transparency = desc.backgroundTransparency;
            }

            if (desc.modal !== undefined) {
                this.modal = desc.modal;
            }
        },

        height: glib.Property({
            get: function () {
                return this.drawableData.dimensions.height;
            },
            set: function (h) {
                this.drawableData.dimensions.height = h;
                this.panel.height = h;
                this.clip.height = h;
                this.client.height = h - this.clientOffset;
                if (this.border) {
                    this.border.height = h;
                }
                this.dispatchEvent('resize');
            }
        }),

        width: glib.Property({
            get: function () {
                return this.drawableData.dimensions.width;
            },
            set: function (w) {
                this.drawableData.dimensions.width = w;
                this.panel.width = w;
                this.clip.width = w;
                this.client.width = w;
                if (this.border) {
                    this.border.width = w;
                }
                this.dispatchEvent('resize');
            }
        }),

        text: glib.Property({
            get: function () {
                return this.caption.text;
            },
            set: function (s) {
                this.caption.text = s;
            }
        })
    });

}());

(function () {
    "use strict";

    var buttonClicked = function () {
        if (this.window.callback) {
            this.window.callback.call(this.window.context, this.index);
        }
        this.window.close();
    };

    glib.MessageWindow = glib.Class({ inherit$: glib.Window,

        $: function (text, textFont, buttons, callback, context, buttonFont) {
            var dw = glib.desktop.width / 1.6666,
                dh = glib.desktop.height / 2,
                btnFont = (buttonFont === undefined) ? textFont : buttonFont,
                wrapped = textFont.wrapText(text, dw - 20, '\r'),
                dim = textFont.measureText(wrapped),
                h = dim.height + 65 + btnFont.height,
                i,
                w,
                tw,
                b,
                button,
                controls;
            glib.Window.call(this, {
                x: glib.desktop.width / 2,
                y: dh,
                width: dw,
                height: h,
                borderWidth: 4,
                cornerRadius: 8,
                backgroundTransparency: 224,
                modal: true
            });
            this.setPivot(0.5, 0.5);
            this.buttonHolder = new glib.Drawable();
            this.textBox = new glib.TextBox(20, 10, this.width - 50, dim.height, text, textFont);
            this.client.addChild(this.textBox);
            w = 0;
            for (i = 0; i < buttons.length; ++i) {
                b = buttons[i];
                tw = btnFont.measureText(b).width + 20;
                button = new glib.TextButton(b, btnFont, w, 0, tw, btnFont.height + 8, buttonClicked, null, 4);
                button.index = i;
                button.window = this;
                this.buttonHolder.addChild(button);
                w += tw + 20;
            }
            this.buttonHolder.size = { width: 0, height: btnFont.height + 8 };
            this.buttonHolder.setPosition(this.width - w, this.height - 16);
            this.buttonHolder.setPivot(0, 1);
            this.clip.addChild(this.buttonHolder);
            this.callback = callback;
            this.context = context;
            this.addEventHandler('resize', function () {
                this.buttonHolder.setPosition(this.buttonHolder.x, this.height - 16);
            }, this);
        }
    });

    glib.MessageBox = glib.Class({ inherit$: glib.Drawable,

        $: function (text, textFont, buttons, callback, context, buttonFont) {
            glib.Drawable.call(this);
            this.panel = new glib.Panel(0, 0, glib.desktop.width, glib.desktop.height, "black");
            this.msgBox = new glib.MessageWindow(text, textFont, buttons, callback, context, buttonFont);
            this.addChild(this.panel);
            this.addChild(this.msgBox);
            this.msgBox.addEventHandler('closing', function () {
                this.close();
            }, this);
            this.age = 0;
            this.msgBox.panel.transparency = 0;
            this.panel.transparency = 0;
        },

        onUpdate: function (time, deltaTime) {
            var t;
            this.age += deltaTime;
            t = Math.min(1, this.age / 125);    // half a second to face in
            t = glib.Util.ease(t);
            this.msgBox.panel.transparency = t * 224;
            this.panel.transparency = t * 96;
            this.msgBox.client.transparency = t * 224;
        },

        text: glib.Property({
            get: function () {
                return this.msgBox.text;
            },
            set: function (t) {
                this.msgBox.text = t;
            }
        }),

        window: glib.Property({
            get: function () {
                return this.msgBox;
            }
        })
    });

}());//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var held = [],
        pressed = [],
        released = [],
        previous = [],
        q = [],
        clr = [],
        lastKey,
        frozen,

        keyLookup = {
            none: 0,
            backspace: 8,
            tab: 9,
            enter: 13,
            shift: 16,
            ctrl: 17,
            space: 32,
            pgup: 33,
            pgdn: 34,
            end: 35,
            home: 36,
            left: 37,
            up: 38,
            right: 39,
            down: 40,
            ins: 45,
            del: 46,
            0: 48,
            1: 49,
            2: 50,
            3: 51,
            4: 52,
            5: 53,
            6: 54,
            7: 55,
            8: 56,
            9: 57,
            a: 65,
            b: 66,
            c: 67,
            d: 68,
            e: 69,
            f: 70,
            g: 71,
            h: 72,
            i: 73,
            j: 74,
            k: 75,
            l: 76,
            m: 77,
            n: 78,
            o: 79,
            p: 80,
            q: 81,
            r: 82,
            s: 83,
            t: 84,
            u: 85,
            v: 86,
            w: 87,
            x: 88,
            y: 89,
            z: 90
        },

    //////////////////////////////////////////////////////////////////////

        keyNames = {
            0: "none",
            8: "backspace",
            9: "tab",
            13: "enter",
            16: "shift",
            17: "ctrl",
            32: "space",
            33: "pgup",
            34: "pgdn",
            35: "end",
            36: "home",
            37: "left",
            38: "up",
            39: "right",
            40: "down",
            45: "ins",
            46: "del",
            48: "0",
            49: "1",
            50: "2",
            51: "3",
            52: "4",
            53: "5",
            54: "6",
            55: "7",
            56: "8",
            57: "9",
            65: "a",
            66: "b",
            67: "c",
            68: "d",
            69: "e",
            70: "f",
            71: "g",
            72: "h",
            73: "i",
            74: "j",
            75: "k",
            76: "l",
            77: "m",
            78: "n",
            79: "o",
            80: "p",
            81: "q",
            82: "r",
            83: "s",
            84: "t",
            85: "u",
            86: "v",
            87: "w",
            88: "x",
            89: "y",
            90: "z"
        };

    //////////////////////////////////////////////////////////////////////

    glib.Keyboard = {

        //////////////////////////////////////////////////////////////////////

        init: function () {
            var i = 0;
            for (i = 0; i < 255; i += 1) {
                held[i] = false;
                pressed[i] = false;
                released[i] = false;
                previous[i] = false;
            }

            window.addEventListener('keydown', function (e) {
                q.push(new glib.KeyDownMessage(keyNames[e.which], e.which));
            }, false);

            window.addEventListener('keyup', function (e) {
                q.push(new glib.KeyUpMessage(keyNames[e.which], e.which));
            }, false);
        },

        //////////////////////////////////////////////////////////////////////

        update: function (root) {

            var last = 0;
            while (clr.length > 0) {
                if (clr[0].action) {
                    pressed[clr[0].key] = false;
                } else {
                    released[clr[0].key] = false;
                }
                clr.shift();
            }

            while (q.length > 0) {
                switch(q[0].type) {
                    case glib.Message.keyDown:
                        pressed[q[0].key] = true;
                        held[q[0].key] = true;
                        last = q[0].key;
                        root.processMessage(q[0]);
                        break;
                    case glib.Message.keyUp:
                        released[q[0].key] = true;
                        held[q[0].key] = false;
                        root.processMessage(q[0]);
                        break;
                }
                clr.push(q.shift());
            }
            lastKey = last !== 0 ? keyNames[last] : null;
        },

        //////////////////////////////////////////////////////////////////////

        freeze: function () {
            frozen = true;
        },

        //////////////////////////////////////////////////////////////////////

        unfreeze: function () {
            frozen = false;
        },

        //////////////////////////////////////////////////////////////////////

        held: function (key) {
            return frozen ? false : held[keyLookup[key.toLowerCase()]];
        },

        //////////////////////////////////////////////////////////////////////

        pressed: function (key) {
            return frozen ? false : pressed[keyLookup[key.toLowerCase()]];
        },

        //////////////////////////////////////////////////////////////////////

        released: function (key) {
            return frozen ? false : released[keyLookup[key.toLowerCase()]];
        },

        //////////////////////////////////////////////////////////////////////

        lastKeyPressed: function () {
            return frozen ? "" : lastKey;
        }
    };

}());

//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    function relMouseCoords(elem, x, y) {

        var totalOffsetX = 0,
            totalOffsetY = 0,
            currentElement = elem;
        do {
            totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
            totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
            currentElement = currentElement.offsetParent;
        } while (currentElement !== null);
        return { x: x - totalOffsetX, y: y - totalOffsetY };
    }

    //////////////////////////////////////////////////////////////////////

    function fixupMouseEvent(event) {
        var b;
        event = event || window.event;
        return {
            e: event,
            target: event.target || event.srcElement,
            which: event.which,
            x: event.x || event.clientX,
            y: event.y || event.clientY
        };
    }

    //////////////////////////////////////////////////////////////////////

    function addListener(element, name, func) {
        element.addEventListener(name, func, false);
    }

    //////////////////////////////////////////////////////////////////////

    function viewport() {
        var wnd = window,
            innerW = 'innerWidth',
            innerH = 'innerHeight';
        if (!window.hasOwnProperty('innerWidth')) {
            innerW = 'clientWidth';
            innerH = 'clientHeight';
            wnd = document.documentElement || document.body;
        }
        return { width: wnd[innerW], height: wnd[innerH] };
    }

    //////////////////////////////////////////////////////////////////////

    function setMouseCapture(element, canvas, mouse, events) {
        if (element.setCapture) {
            element.setCapture();
        }

/*        document.oncontextmenu = function (e) {
            e.cancelBubble = true;
            return false;
        };
*/
        addListener(element, "losecapture", function () {
            if (element.setCapture) {
                element.setCapture();
            }
        });

        addListener(element, "touchstart", function (event) {
            var touch = event.targetTouches[0],
                pos = relMouseCoords(canvas, touch.clientX, touch.clientY);
            events.push(new glib.TouchMessage(glib.Message.touchStart, pos));
            event.preventDefault();
            return false;
        });

        addListener(element, "touchmove", function (event) {
            var touch = event.targetTouches[0],
                pos = relMouseCoords(canvas, touch.clientX, touch.clientY);
            events.push(new glib.TouchMessage(glib.Message.touchMove, pos));
            event.preventDefault();
            return false;
        });

        addListener(element, "touchend", function (event) {
            events.push(new glib.TouchMessage(glib.Message.touchEnd, { x: 0, y: 0 }, true));
            event.preventDefault();
            return false;
        });

        addListener(element, "mousedown", function (event) {
            var p;
            if (element.setCapture) {
                element.setCapture();
            }
            event = fixupMouseEvent(event);
            p = relMouseCoords(canvas, event.x, event.y);
            switch (event.which) {
            case 1:
                mouse.left.held = true;
                events.push(new glib.MouseMessage(glib.Message.leftMouseDown, p));
                break;
            case 3:
                mouse.right.held = true;
                events.push(new glib.MouseMessage(glib.Message.rightMouseDown, p));
                break;
            }
            return false;
        });

        addListener(element, "mouseup", function (event) {
            var p;
            event = fixupMouseEvent(event);
            p = relMouseCoords(canvas, event.x, event.y);
            switch (event.which) {
            case 1:
                mouse.left.held = false;
                events.push(new glib.MouseMessage(glib.Message.leftMouseUp, p));
                break;
            case 3:
                mouse.right.held = false;
                events.push(new glib.MouseMessage(glib.Message.rightMouseUp, p));
                break;
            }
        });

        addListener(element, "mousemove", function (event) {
            var view = viewport(),
                e,
                p;
            event = window.event || event;
            if (event && event.preventDefault) {
                event.preventDefault();
            }
            e = fixupMouseEvent(event);
            p = relMouseCoords(canvas, e.x, e.y);
            mouse.position.x = p.x;
            mouse.position.y = p.y;
            if (e.y < 0 || e.y > view.height || e.x < 0 || e.x > view.width) {
                if (element.releaseCapture) {    // allow IE to see mouse clicks outside client area
                    element.releaseCapture();
                }
            } else {
                if (element.setCapture) {
                    element.setCapture();
                }
            }
            events.push(new glib.MouseMessage(glib.Message.mouseMove, p));
        });
    }

    //////////////////////////////////////////////////////////////////////

    function updateButton(b) {
        var delta = b.held !== b.prev;
        b.pressed = delta && b.held;
        b.released = delta && !b.held;
        b.prev = b.held;
    }

    //////////////////////////////////////////////////////////////////////

    var IMouse = function () {
        this.position = { x: -1, y: -1 };
        this.delta = { x: 0, y: 0 };
        this.left = { held: false, pressed: false, released: false, prev: false };
        this.right = { held: false, pressed: false, released: false, prev: false };
    },

        old = { x: 0, y: 0 },
        frozen = new IMouse(),
        active = new IMouse(),
        cur = active,
        events = [];

    glib.Mouse = glib.Class({

        static$: {

            init: function (canvasElement) {
                setMouseCapture(document.body, canvasElement, active, events);
            },

            update: function (root) {
                var e;
                updateButton(active.left);
                updateButton(active.right);
                active.delta.x = active.position.x - old.x;
                active.delta.y = active.position.y - old.y;
                old.x = active.position.x;
                old.y = active.position.y;
                while (events.length > 0) {
                    root.processMessage(events.shift());
                }
            },

            freeze: function () {
                cur = frozen;
            },

            unfreeze: function () {
                cur = active;
            },

            position: glib.Property({
                get: function () {
                    return cur.position;
                }
            }),

            delta: glib.Property({
                get: function () {
                    return cur.delta;
                }
            }),

            left: glib.Property({
                get: function () {
                    return cur.left;
                }
            }),

            right: glib.Property({
                get: function () {
                    return cur.right;
                }
            })
        }
    });

}());
//////////////////////////////////////////////////////////////////////

glib.Debug = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var font,
        context,
        d = [],
        cursorX,
        cursorY;

    //////////////////////////////////////////////////////////////////////

    return {

        init: function (ctx, fnt) {
            font = fnt;
            context = ctx;
            cursorX = 0;
            cursorY = 0;
        },

        text: function (x, y, things) {
            var i,
                s = "",
                c = "",
                a;
            for (i = 2; i < arguments.length; ++i) {
                a = arguments[i];
                if (a === undefined) {
                    a = "undefined";
                }
                else if (typeof a !== 'string') {
                    a = a.toString();
                }
                s = s + c + a;
                c = ",";
            }
            d.push("text", s, x, y);
        },

        print: function () {
            glib.Debug.text.apply(this, [cursorX, cursorY].concat(Array.prototype.slice.call(arguments, 0)));
            cursorY += font.height;
        },

        rect: function (x, y, w, h, colour) {
            d.push("rect", x, y, w, h, colour);
        },

        fillRect: function (x, y, w, h, colour) {
            d.push("fillrect", x, y, w, h, colour);
        },

        poly: function (points, colour) {
            var i;
            d.push("poly", points.length, colour);
            for (i = 0; i < points.length; ++i) {
                d.push(points[i].x, points[i].y);
            }
        },

        line: function (x1, y1, x2, y2, colour) {
            d.push("line", x1, y1, x2, y2, colour);
        },

        draw: function () {
            var i,
                l,
                colour;
            context.setTransform(1, 0, 0, 1, 0, 0);
            while (d.length > 0) {
                switch (d.shift()) {
                case 'text':    // x, y, string
                    font.renderString(context, d.shift(), d.shift(), d.shift());
                    break;
                case 'rect':    // x, y, w, h, colour
                    glib.Util.rect(context, d.shift(), d.shift(), d.shift(), d.shift());
                    context.strokeStyle = d.shift();
                    context.stroke();
                    break;
                case 'fillrect':    // x, y, w, h, colour
                    glib.Util.rect(context, d.shift(), d.shift(), d.shift(), d.shift());
                    context.fillStyle = d.shift();
                    context.fill();
                    break;
                case 'line':    // x1, y1, x1, y1, colour
                    context.beginPath();
                    context.moveTo(d.shift(), d.shift());
                    context.lineTo(d.shift(), d.shift());
                    context.strokeStyle = d.shift();
                    context.stroke();
                    break;
                case 'poly':
                    context.beginPath();
                    l = d.shift();
                    colour = d.shift();
                    context.moveTo(d.shift(), d.shift());
                    for (i = 1; i < l; ++i) {
                        context.lineTo(d.shift(), d.shift());
                    }
                    context.closePath();
                    context.fillStyle = colour;
                    context.fill();
                }
            }
            cursorX = 0;
            cursorY = 0;
        }
    };
}());
(function () {
    "use strict";

    var canvas;

    function centerCanvas() {
        document.body.style.position = "absolute";
        document.body.style.margin = "0px";
        document.body.style.padding = "0px";
        document.body.style.left = "0px";
        document.body.style.top = "0px";
        document.body.style.width = window.innerWidth + "px";
        document.body.style.height = window.innerHeight + "px";
        canvas.style.top = Math.floor((document.body.clientHeight - canvas.height) / 2) + "px";
        canvas.style.left = Math.floor((document.body.clientWidth - canvas.width) / 2) + "px";
    }

    glib.Desktop = glib.Class({ inherit$: glib.Panel,

        $: function (width, height, color)
        {
            glib.Panel.call(this, 0, 0, width, height, color);
            canvas = document.createElement("canvas");
            canvas.width = this.width;
            canvas.height = this.height;
            canvas.style.position = "absolute";
            centerCanvas();
            window.onresize = centerCanvas;
            document.body.appendChild(canvas);
            this.context = canvas.getContext("2d");
            this.canvas = canvas;
        },

        width: glib.Property({
            get: function() {
                return this.drawableData.dimensions.width;
            },
            set: function(w) {
                this.drawableData.dimensions.width = w;
                this.drawableData.dirty = true;
                this.canvas.width = w;
                centerCanvas();
            }
        }),

        height: glib.Property({
            get: function() {
                return this.drawableData.dimensions.height;
            },
            set: function(h) {
                this.drawableData.dimensions.height = h;
                this.drawableData.dirty = true;
                this.canvas.height = h;
                centerCanvas();
            }
        }),

        clear: function() {
            this.context.clearRect(0, 0, this.width, this.height);
        }
    });

} ());
//////////////////////////////////////////////////////////////////////

window.onload = function () {
    "use strict";

    var identityMatrix = new glib.Matrix(),

        startup = glib.Class({

        static$: {

            init: function () {
                var loader;
                glib.desktop = new glib.Desktop(852, 480, "rgb(32, 128, 48)");
                loader = new glib.Loader('img/');
                glib.Debug.init(glib.desktop.context, glib.Font.load("Fixedsys", loader));
                loader.addEventHandler("complete", startup.start);
                loader.start();
            },

            start: function () {
                glib.Mouse.init(glib.desktop.canvas);
                glib.Keyboard.init();
                glib.Timer.init();
                if (typeof window.main === "function") {
                    window.main(glib.desktop);
                }
                startup.run();
            },

            run: function () {
                glib.Timer.update();
                glib.Keyboard.update(glib.desktop);
                glib.Mouse.update(glib.desktop);
                glib.desktop.update(glib.Timer.time, glib.Timer.delta);
                glib.desktop.draw(glib.desktop.context, identityMatrix, 255);
                // glib.Canvas.showCache();
                // mtw.WordButton.showCache();
                glib.Debug.draw();
                requestAnimationFrame(startup.run);
            }
        }
    });

    startup.init();
};
