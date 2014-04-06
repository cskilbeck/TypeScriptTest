//////////////////////////////////////////////////////////////////////

window.requestAnimFrame = (function () {
    "use strict";

    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
}());

//////////////////////////////////////////////////////////////////////

window.performance = window.performance || {};

performance.now = (function () {
    "use strict";

    return performance.now ||
            performance.mozNow ||
            performance.msNow ||
            performance.oNow ||
            performance.webkitNow ||
        function () {
            return new Date().getTime();
        };
}());

//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    try {
        var a = new Uint8Array(1);
        return; //no need
    } catch (e) { }

    function subarray(start, end) {
        return this.slice(start, end);
    }

    function setArray(array, offset) {
        var i,
            n,
            o = offset || 0;
        for (i = 0, n = array.length; i < n; ++i, ++offset) {
            this[o] = array[i] & 0xFF;
        }
    }

    // we need typed arrays
    function TypedArray(arg1) {
        var result,
            i;
        if (typeof arg1 === "number") {
            result = [];
            result.length = (arg1);
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


//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    if (XMLHttpRequest.prototype.response === undefined ||
            XMLHttpRequest.prototype.mozResponseArrayBuffer === undefined ||
            XMLHttpRequest.prototype.mozResponse === undefined ||
            XMLHttpRequest.prototype.responseArrayBuffer === undefined) {
        return;
    }
    Object.defineProperty(XMLHttpRequest.prototype, "response", {
        get: function () {
            return new Uint8Array(new VBArray(this.responseBody).toArray());
        }
    });
}());

//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    if (window.btoa !== undefined) {
        return;
    }

    var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    window.btoa = function (chars) {
        var buffer = "",
            i,
            n,
            b1,
            b2,
            b3,
            d1,
            d2,
            d3,
            d4;
        for (i = 0, n = chars.length; i < n; i += 3) {
            b1 = chars.charCodeAt(i) & 0xFF;
            b2 = chars.charCodeAt(i + 1) & 0xFF;
            b3 = chars.charCodeAt(i + 2) & 0xFF;
            d1 = b1 >>> 2;
            d2 = ((b1 & 3) << 4) | (b2 >>> 4);
            d3 = i + 1 < n ? ((b2 & 0xF) << 2) | (b3 >>> 6) : 64;
            d4 = i + 2 < n ? (b3 & 0x3F) : 64;
            buffer += digits.charAt(d1) + digits.charAt(d2) + digits.charAt(d3) + digits.charAt(d4);
        }
        return buffer;
    };
}());