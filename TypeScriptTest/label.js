//////////////////////////////////////////////////////////////////////

var Label = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Label = function (text, font) {
        Drawable.call(this);
        this.str = text;
        this.font = font;
        this.dimensions = null;
    };

    //////////////////////////////////////////////////////////////////////

    Label.prototype = {

        //////////////////////////////////////////////////////////////////////

        size: function () {
            if (this.dimensions === null) {
                this.dimensions = this.font.measureText(this.str);
            }
            return this.dimensions;
        },

        //////////////////////////////////////////////////////////////////////

        onDraw: function (context) {
            this.font.renderString(context, this.str, 0, 0);
        }
    };

    //////////////////////////////////////////////////////////////////////

    Object.defineProperty(Label.prototype, "text", {
        get: function () {
            return this.str;
        },
        set: function (s) {
            this.str = s;
            this.dimensions = null;
        }
    });

    return Label.extend(Drawable);

}());