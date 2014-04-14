//////////////////////////////////////////////////////////////////////

var Debug = (function () {
    "use strict";

    var font,
        context,
        d = [],
        cursorX,
        cursorY;

    return {

        init: function (ctx, fnt) {
            font = fnt;
            context = ctx;
            cursorX = 0;
            cursorY = 0;
        },

        text: function (x, y, str) {
            d.push(str, x, y);
        },

        print: function (str) {
            Debug.text(cursorX, cursorY, str);
            cursorY += font.height;
        },

        draw: function () {
            context.setTransform(1, 0, 0, 1, 0, 0);
            while (d.length > 0) {
                font.renderString(context, d.shift(), d.shift(), d.shift());
            }
            cursorX = 0;
            cursorY = 0;
        }
    };
}());
