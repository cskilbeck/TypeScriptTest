//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////
    // limit cache size...

    var canvasCache = [];

    chs.Canvas = chs.Class({

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
                    r = new chs.Canvas(w, h);
                }
                return r;
            },
            showCache: function () {
                canvasCache.forEach(function(c) {
                    chs.Debug.print(c.width, c.height);
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
