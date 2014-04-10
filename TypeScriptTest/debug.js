//////////////////////////////////////////////////////////////////////

var Debug = (function () {
    "use strict";

    var font,
        context,
        d = [];

    return {

        init: function (ctx, fnt) {
            font = fnt;
            context = ctx;
        },

        text: function (x, y, str) {
            d.push(str, x, y);
        },

        draw: function () {
            context.setTransform(1, 0, 0, 1, 0, 0);
            while (d.length > 0) {
                font.renderString(context, d.shift(), d.shift(), d.shift());
            }
        }
    };
}());
