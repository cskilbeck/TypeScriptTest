//////////////////////////////////////////////////////////////////////

var Debug = (function () {
    "use strict";

    var font,
        context,
        d = [],

        Debug = {

            init: function (ctx, loader) {
                font = new Font(loader.load("Fixedsys.json"), loader.load("Fixedsys0.png"));
                context = ctx;
            },

            text: function (x, y, str) {
                d.push(x, y, str);
            },

            draw: function () {
                while (d.length > 0) {
                    font.drawText(context, d.shift(), d.shift(), d.shift());
                }
            }
        };

    return Debug;
}());
