//////////////////////////////////////////////////////////////////////

var Label = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Label = function (text, font) {
        Drawable.call(this);
        this.labelData = {
            str: text,
            font: font,
            dimensions: null
        };
    };

    //////////////////////////////////////////////////////////////////////

    Label.prototype = {

        //////////////////////////////////////////////////////////////////////

        size: function () {
            var self = this.labelData;
            if (self.dimensions === null) {
                self.dimensions = this.font.measureText(this.text);
            }
            return self.dimensions;
        },

        //////////////////////////////////////////////////////////////////////

        onDraw: function (context) {
            this.font.renderString(context, this.text, 0, 0);
        }
    };

    //////////////////////////////////////////////////////////////////////

    Object.defineProperty(Label.prototype, "text", {
        get: function () {
            return this.labelData.str;
        },
        set: function (s) {
            this.labelData.str = s;
            this.labelData.dimensions = null;
        }
    });

    //////////////////////////////////////////////////////////////////////

    Object.defineProperty(Label.prototype, "font", {
        get: function () {
            return this.labelData.font;
        },
        set: function (f) {
            this.labelData.font = f;
            this.labelData.dimensions = null;
        }
    });

    //////////////////////////////////////////////////////////////////////

    Util.extendPrototype(Label, Drawable);

    return Label;

}());