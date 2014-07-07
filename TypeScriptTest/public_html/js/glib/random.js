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
