(function () {
    "use strict";

    chs.MessageBox = chs.Class({
        inherits: chs.Window,

        $: function (text, textFont, buttons, buttonFont) {
            var dw = chs.desktop.width / 2,
                dh = chs.desktop.height / 2,
                wrapped = textFont.wrapText(text, dw - 20, '\n'),
                dim = textFont.measureText(wrapped),
                h = dim.height + 20 + buttonFont.height,
                i,
                w,
                tw,
                b,
                button,
                buttonHolder = new chs.Drawable(),
                controls;
            chs.Window.call(this, dw, dh, dw, h, null, null, 8, "black", 1, false, false).setPivot(0.5, 0.5);
            this.client.addChild(new chs.TextBox(10, 10, this.width - 20, this.height - buttonFont.height + 10, text, textFont));
            w = 0;
            for (i in buttons) {
                b = buttons[i]; // { text: "Yes", callback: function () {}, context: this }
                tw = buttonFont.measureText(b.text).width + 10;
                button = new chs.FancyTextButton(b.text, buttonFont, w, 0, tw, buttonFont.height + 5);
                buttonHolder.addChild(button);
                w += button.width + 10;
            }
            buttonHolder.setPosition(this.width - 10 - w, this.height - buttonFont.height - 5);
            this.addChild(buttonHolder);
        }
    });

}());