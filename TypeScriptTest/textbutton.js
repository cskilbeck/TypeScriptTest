//////////////////////////////////////////////////////////////////////

var TextButton = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    function TextButton(text, font, image, x, y, clicked, context) {
        Button.call(this, image, x, y, clicked, context);
        this.text = text;
        this.font = font;
    }

    //////////////////////////////////////////////////////////////////////

    return Util.extendClass(Button, TextButton, {

        draw: function (context) {
            Button.prototype.draw.call(this, context);
            this.font.drawText(context, this.text, this.position, this.rotation, this.scale, Font.center, Font.middle);
        }

    });

}());