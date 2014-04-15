//////////////////////////////////////////////////////////////////////

chs.Debug = (function () {
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

        text: function (x, y, things) {
            var i,
                s = "",
                c = "",
                a;
            for (i = 2; i < arguments.length; ++i) {
                a = arguments[i];
                if (typeof a !== 'string') {
                    a = a.toString();
                }
                s = s + c + a;
                c = ",";
            }
            d.push(s, x, y);
        },

        print: function (str) {
            chs.Debug.text(cursorX, cursorY, str);
            cursorY += font.height;
        },

        draw: function () {
            var x,
                y,
                str;
            context.setTransform(1, 0, 0, 1, 0, 0);
            while (d.length > 0) {
                font.renderString(context, d.shift(), d.shift(), d.shift());
            }
            cursorX = 0;
            cursorY = 0;
        }
    };
}());
