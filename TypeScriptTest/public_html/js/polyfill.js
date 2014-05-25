//////////////////////////////////////////////////////////////////////

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

    performance.now = (function () {

        return performance.now ||
                performance.mozNow ||
                performance.msNow ||
                performance.oNow ||
                performance.webkitNow ||
            function () {
                return Date().now();
            };
    }());

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
