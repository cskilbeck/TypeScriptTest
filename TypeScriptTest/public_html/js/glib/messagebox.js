(function () {
    "use strict";

    var buttonClicked = function () {
        if (this.window.callback) {
            this.window.callback.call(this.window.context, this.index);
        }
        this.window.close();
    };

    glib.MessageWindow = glib.Class({ inherit$: glib.Window,

        $: function (text, textFont, buttons, callback, context, buttonFont) {
            var dw = glib.Playfield.Width / 1.6666,
                dh = glib.Playfield.Height / 2,
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
            glib.Window.call(this, {
                x: glib.Playfield.Width / 2,
                y: dh,
                width: dw,
                height: h,
                borderWidth: 4,
                cornerRadius: 8,
                backgroundTransparency: 224,
                modal: true
            });
            this.setPivot(0.5, 0.5);
            this.buttonHolder = new glib.Drawable();
            this.textBox = new glib.TextBox(20, 10, this.width - 50, dim.height, text, textFont);
            this.client.addChild(this.textBox);
            w = 0;
            for (i = 0; i < buttons.length; ++i) {
                b = buttons[i];
                tw = btnFont.measureText(b).width + 20;
                button = new glib.TextButton(b, btnFont, w, 0, tw, btnFont.height + 8, buttonClicked, null, 4);
                button.index = i;
                button.window = this;
                this.buttonHolder.addChild(button);
                w += tw + 20;
            }
            this.buttonHolder.size = { width: 0, height: btnFont.height + 8 };
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

    glib.MessageBox = glib.Class({ inherit$: glib.Drawable,

        $: function (text, textFont, buttons, callback, context, buttonFont) {
            glib.Drawable.call(this);
            this.panel = new glib.Panel(0, 0, glib.Playfield.Width, glib.Playfield.Height, "black");
            this.msgBox = new glib.MessageWindow(text, textFont, buttons, callback, context, buttonFont);
            this.addChild(this.panel);
            this.addChild(this.msgBox);
            this.msgBox.addEventHandler('closing', function () {
                this.close();
            }, this);
            this.age = 0;
            this.msgBox.panel.transparency = 0;
            this.panel.transparency = 0;
        },

        onUpdate: function (time, deltaTime) {
            var t;
            this.age += deltaTime;
            t = Math.min(1, this.age * 6);    // 1/6th of a second to fade in
            t = glib.Util.ease(t);
            this.msgBox.panel.transparency = t * 224;
            this.panel.transparency = t * 96;
            this.msgBox.client.transparency = t * 224;
        },

        text: glib.Property({
            get: function () {
                return this.msgBox.text;
            },
            set: function (t) {
                this.msgBox.text = t;
            }
        }),

        window: glib.Property({
            get: function () {
                return this.msgBox;
            }
        })
    });

}());