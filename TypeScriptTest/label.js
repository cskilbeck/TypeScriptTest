//////////////////////////////////////////////////////////////////////

var Label = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Label = function (text, font) {
        Drawable.call(this);
        this.text = text;
        this.font = font;
        this.dimensions = null;
    };

    //////////////////////////////////////////////////////////////////////

    Util.extendClass(Drawable, Label, {

        //////////////////////////////////////////////////////////////////////

        size: function () {
            if (this.dimensions === null) {
                this.dimensions = this.font.measureText(this.text);
            }
            return this.dimensions;
        },

        //////////////////////////////////////////////////////////////////////

        onDraw: function (context) {
            this.font.renderString(context, this.text, 0, 0);
        }
    });

    return Label;

}());