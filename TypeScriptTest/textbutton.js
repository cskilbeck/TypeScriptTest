﻿//////////////////////////////////////////////////////////////////////

chs.TextButton = (function () {
    "use strict";

    var TextButton = function (text, font, x, y, click, hover, context) {
        chs.Button.call(this, click, hover, context);
        chs.Label.call(this, text, font);
        this.setPosition(x, y);
        this.text = text;
        this.font = font;
    };

    chs.Util.extendPrototype(TextButton, chs.Button);
    chs.Util.extendPrototype(TextButton, chs.Label);

    return TextButton;

}());

//////////////////////////////////////////////////////////////////////

chs.FancyTextButton = (function () {
    "use strict";

    var FancyTextButton = function (text, font, x, y, w, h, click, hover, context) {
        chs.PanelButton.call(this, x, y, w, h, "darkGrey", "lightGrey", h / 3, 3, click, hover, context, 4);
        this.label = new chs.Label(text, font);
        this.label.setPosition(w / 2, h / 2);
        this.label.setPivot(0.5, 0.5);
        this.addChild(this.label);
    };

    chs.Util.extendPrototype(FancyTextButton, chs.PanelButton);

    return chs.Util.overridePrototype(FancyTextButton, {

        onHover: function () {
            this.lineColour = "white";
            this.label.setPosition(this.width / 2, this.height / 2);
        },

        onIdle: function () {
            this.lineColour = "lightGrey";
            this.label.setPosition(this.width / 2, this.height / 2);
        },

        onPressed: function () {
            this.lineColour = "black";
            this.label.setPosition(this.width / 2 + 1, this.height / 2 + 1);
        }
    });

}());
