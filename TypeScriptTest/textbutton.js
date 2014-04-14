//////////////////////////////////////////////////////////////////////

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

    Util.extendPrototype(TextButton, Button);
    Util.extendPrototype(TextButton, Label);

    return TextButton;

}());

var FancyTextButton = (function () {
    "use strict";

    var FancyTextButton = function (text, font, x, y, w, h, colour, click, hover, context) {
        PanelButton.call(this, x, y, w, h, colour);
        this.label = new Label(text, font);
        this.addChild(this.label);
    };

    FancyTextButton.prototype = {
        onHover: function () {
            this.colour = "lightgrey";
            this.label.setPosition(0, 0);
        },
        onIdle: function () {
            this.colour = "grey";
            this.label.setPosition(0, 0);
        },
        onPressed: function () {
            this.colour = "lightgrey";
            this.label.setPosition(1, 1);
        }
    };

    Util.extendPrototype(FancyTextButton, PanelButton);

    return FancyTextButton;
}());