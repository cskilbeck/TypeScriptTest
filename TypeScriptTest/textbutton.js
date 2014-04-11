﻿//////////////////////////////////////////////////////////////////////

var TextButton = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var TextButton = function (text, font, x, y, click, hover, context) {
        Button.call(this, click, hover, context);
        Label.call(this, text, font);
        this.setPosition(x, y);
        this.text = text;
        this.font = font;
    };

    Util.extendClass(Button, TextButton);
    Util.extendClass(Label, TextButton);

    return TextButton;

}());