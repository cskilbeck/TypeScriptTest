//////////////////////////////////////////////////////////////////////

chs.Debug = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var font,
        context,
        d = [],
        cursorX,
        cursorY;

    //////////////////////////////////////////////////////////////////////

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
            d.push("text", s, x, y);
        },

        print: function () {
            chs.Debug.text.apply(this, [cursorX, cursorY].concat(Array.prototype.slice.call(arguments, 0)));
            cursorY += font.height;
        },

        rect: function (x, y, w, h, colour) {
            d.push("rect", x, y, w, h, colour);
        },

        line: function (x1, y1, x2, y2, colour) {
            d.push("line", x1, y1, x2, y2, colour);
        },

        draw: function () {
            context.setTransform(1, 0, 0, 1, 0, 0);
            while (d.length > 0) {
                switch (d.shift()) {
                case 'text':    // x, y, string
                    font.renderString(context, d.shift(), d.shift(), d.shift());
                    break;
                case 'rect':    // x, y, w, h, colour
                    chs.Util.rect(context, d.shift(), d.shift(), d.shift(), d.shift());
                    context.fillStyle = d.shift();
                    context.stroke();
                    break;
                case 'line':    // x1, y1, x1, y1, colour
                    context.beginPath();
                    context.moveTo(d.shift(), d.shift());
                    context.lineTo(d.shift(), d.shift());
                    context.fillStyle = d.shift();
                    context.stroke();
                    break;
                }
            }
            cursorX = 0;
            cursorY = 0;
        }
    };
}());
