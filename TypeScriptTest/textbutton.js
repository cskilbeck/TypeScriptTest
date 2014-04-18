//////////////////////////////////////////////////////////////////////

chs.TextButton = (function () {
    "use strict";

    var TextButton = function (text, font, x, y, click, context) {
        chs.Button.call(this, click, context);
        chs.Label.call(this, text, font);
        this.setPosition(x, y);
        this.text = text;
        this.font = font;
    };

    chs.extend(TextButton, chs.Button);
    chs.extend(TextButton, chs.Label);

    return TextButton;

}());

//////////////////////////////////////////////////////////////////////

chs.FancyTextButton = (function () {
    "use strict";

    var FancyTextButton = function (text, font, x, y, w, h, click, context) {
        chs.PanelButton.call(this, x, y, w, h, "darkGrey", "lightGrey", h / 3, 3, click, context, 4);
        this.label = new chs.Label(text, font);
        this.label.setPosition(w / 2, h / 2);
        this.label.setPivot(0.5, font.midPivot);
        this.addChild(this.label);
    };

    chs.extend(FancyTextButton, chs.PanelButton);

    return chs.override(FancyTextButton, {

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
