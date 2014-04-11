//////////////////////////////////////////////////////////////////////

var Label = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Label = function (text, font, listNodeName) {
        Drawable.call(this);
        this.text = text;
        this.font = font;
        this.dimensions = null;
    };

    //////////////////////////////////////////////////////////////////////

    return Util.extendClass(Drawable, Label, {

        //////////////////////////////////////////////////////////////////////

        size: function () {
            if(this.dimensions === null) {
                this.dimensions = this.font.measureText(this.text);
            }
            return this.dimensions;
        },

        //////////////////////////////////////////////////////////////////////

        draw: function(context) {
            if (this.setupContext(context)) {
                this.font.renderString(context, this.text, -this.width() * this.pivot.x, -this.height() * this.pivot.y);
            }
            return this.visible;
        }
    });

}());