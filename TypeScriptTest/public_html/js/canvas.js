//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////
    // limit cache size...

    var canvasCache = new chs.List("listNode");

    chs.Canvas = chs.Class({

        static$: {
            create: function (w, h) {
                var n,
                    c,
                    r,
                    s,
                    xd,
                    yd;

                // delete largest canvas until total cache size is < ?? pixels

                for (n = canvasCache.headNode(); n != canvasCache.end(); n = n.next) {
                    c = n.item;
                    xd = c.width - w;
                    yd = c.height - h;
                    if (xd >= 0 && yd >= 0) {
                        if (xd + yd === 0) {
                            r = c;
                            break;
                        }
                        if (s === undefined || (xd + yd) < s) {
                            r = c;
                            s = xd + yd;
                        }
                    }
                }
                if (r) {
                    console.log("Reusing canvas!");
                    canvasCache.remove(r);
                    r.clear();
                } else {
                    console.log("Creating canvas!");
                    r = new chs.Canvas(w, h);
                }
                return r;
            },
        },

        $: function(w, h) {
            this.width = Math.ceil(w) >>> 0;
            this.height = Math.ceil(h) >>> 0;
            this.canvas = document.createElement("canvas");
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.context = this.canvas.getContext("2d");
            this.listNode = new chs.List.Node(this);
        },

        clear: function () {
            this.context.setTransform(1, 0, 0, 1, 0, 0);
            this.context.clearRect(0, 0, this.width, this.height);
        },

        destroy: function() {
            canvasCache.pushFront(this);
        }

    });

}());
