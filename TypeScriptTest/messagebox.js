(function () {
    "use strict";

    var buttonClicked = function () {
        if (this.window.callback) {
            this.window.callback.call(this.window.context, this.index);
        }
        this.window.close();
    };

    chs.MessageWindow = chs.Class({
        inherit$: [chs.Window],

        $: function (text, textFont, buttons, callback, context, buttonFont) {
            var dw = chs.desktop.width / 1.666,
                dh = chs.desktop.height / 2,
                btnFont = (buttonFont === undefined) ? textFont : buttonFont,
                wrapped = textFont.wrapText(text, dw - 20, '\r'),
                dim = textFont.measureText(wrapped),
                h = dim.height + 65 + btnFont.height,
                i,
                w,
                tw,
                b,
                button,
                controls;
            chs.Window.call(this, {
                x: chs.desktop.width / 2,
                y: dh,
                width: dw,
                height: h,
                borderWidth: 4,
                cornerRadius: 8,
                transparency: 192,
                modal: true
            });
            this.setPivot(0.5, 0.5);
            this.buttonHolder = new chs.Drawable(),
            this.textBox = new chs.TextBox(20, 10, this.width - 50, dim.height, text, textFont);
            this.client.addChild(this.textBox);
            w = 0;
            for (i = 0; i < buttons.length; ++i) {
                b = buttons[i];
                tw = btnFont.measureText(b).width + 20;
                button = new chs.TextButton(b, btnFont, w, 0, tw, btnFont.height + 8, buttonClicked, null, 4);
                button.index = i;
                button.window = this;
                this.buttonHolder.addChild(button);
                w += tw + 20;
            }
            this.buttonHolder.dimensions = { width: 0, height: btnFont.height + 8 };
            this.buttonHolder.setPosition(this.width - w, this.height - 16);
            this.buttonHolder.setPivot(0, 1);
            this.clip.addChild(this.buttonHolder);
            this.callback = callback;
            this.context = context;
            this.addEventHandler('resize', function () {
                this.buttonHolder.setPosition(this.buttonHolder.x, this.height - 16);
            }, this);
        }
    });

    chs.MessageBox = chs.Class({
        inherit$: [chs.Panel],

        $: function (text, textFont, buttons, callback, context, buttonFont) {
            chs.Panel.call(this, 0, 0, chs.desktop.width, chs.desktop.height, "black");
            this.transparency = 96;
            this.msgBox = new chs.MessageWindow(text, textFont, buttons, callback, context, buttonFont);
            this.addChild(this.msgBox);
            this.msgBox.addEventHandler('closed', function () {
                this.close();
            }, this);
        },

        text: {
            get: function () {
                return this.msgBox.text;
            },
            set: function (t) {
                this.msgBox.text = t;
            }
        },
        window: {
            get: function () {
                return this.msgBox;
            }
        }
    });

}());