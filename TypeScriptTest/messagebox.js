(function () {
    "use strict";

    var buttonClicked = function () {
        if (this.window.callback) {
            this.window.callback.call(this.window.context, this.index);
        }
        this.window.close();
    };

    chs.MessageBox = chs.Class({
        inherits: chs.Window,

        $: function (text, textFont, buttons, callback, context, buttonFont) {
            var dw = chs.desktop.width / 1.666,
                dh = chs.desktop.height / 2,
                btnFont = (buttonFont === undefined) ? textFont : buttonFont,
                wrapped = textFont.wrapText(text, dw - 20, '\n'),
                dim = textFont.measureText(wrapped),
                h = dim.height + 65 + btnFont.height,
                i,
                w,
                tw,
                b,
                button,
                buttonHolder = new chs.Drawable(),
                controls;
            chs.Window.call(this, {
                x: chs.desktop.width / 2,
                y: dh,
                width: dw,
                height: h,
                borderWidth: 4,
                cornerRadius: 8,
                transparency: 224,
                modal: true
            });
            this.setPivot(0.5, 0.5);

            this.client.addChild(new chs.TextBox(20, 10, this.width - 50, this.height - btnFont.height - 20, text, textFont));
            w = 0;
            for (i = 0; i < buttons.length; ++i) {
                b = buttons[i]; // { text: "Yes", callback: function () {}, context: this }
                tw = btnFont.measureText(b).width + 20;
                button = new chs.FancyTextButton(b, btnFont, w, 0, tw, btnFont.height + 5, buttonClicked, button, 4);
                button.index = i;
                button.window = this;
                buttonHolder.addChild(button);
                w += button.width + 20;
            }
            buttonHolder.setPosition(this.width - w, this.height - btnFont.height - 20);
            this.clip.addChild(buttonHolder);
            this.callback = callback;
            this.context = context;
        }
    });

}());