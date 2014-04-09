//////////////////////////////////////////////////////////////////////

var Debug = (function () {
    "use strict";

    var font,
        context,
        d = [],

        Debug = {

            init: function (ctx, fnt) {
                font = fnt;
                context = ctx;
            },

            text: function (x, y, str) {
                d.push(str, { x: x, y: y });
            },

            draw: function () {
                while (d.length > 0) {
                    font.drawText(context, d.shift(), d.shift());
                }
            }
        };

    return Debug;
}());
