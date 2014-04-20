//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    chs.Menu = chs.extensionOf(chs.Drawable, {

        constructor: function (x, y, font, items) {
            var i,
                ht = font.height,
                w = 0,
                h,
                yp = 0,
                item,
                clip,
                ftb;
            for (i = 0; i < items.length; ++i) {
                item = items[i];
                w = Math.max(w, font.measureText(item.text).width + 8);
            }
            w += 32;
            h = (font.height + 16) * items.length;
            chs.Drawable.call(this);
            this.setPosition(x, y);
            this.dimensions = { width: w, height: h };
            this.clip = new chs.ClipRect(0, 0, w, h, font.height / 3);
            this.addChild(this.clip);
            this.transparency = 224;
            this.font = font;
            this.setPosition(x, y);
            this.buttons = [];
            items.forEach(function (item) {
                ftb = new chs.FancyTextButton(item.text, font, 0, yp, w, font.height + 16, item.clicked, item.context, 0).setPivot(0, 0);
                ftb.lineColour = "white";
                ftb.lineTransparency = 255;
                ftb.onIdle = function () { this.fillColour = 'black'; this.transparency = 192; };
                ftb.onHover = function () { this.fillColour = 'slategrey'; this.transparency = 255; };
                ftb.onPressed = function () { this.fillColour = 'darkslategrey'; this.transparency = 255; };
                ftb.fillColour = 'black';
                ftb.transparency = 192;
                this.clip.addChild(ftb);
                yp += font.height + 16;
                this.buttons.push(ftb);
            }.bind(this));
            this.addChild(new chs.Panel(0, 0, w, h, undefined, "white", font.height / 3, 3, 255));
        }
    });

    //////////////////////////////////////////////////////////////////////

    chs.PopupMenu = chs.extensionOf(chs.Menu, {

        constructor: function (x, y, font, items) {
            chs.Menu.call(this, x, y, font, items);
            this.buttons.forEach(function (button) {
                button.buttonCallback = button.callback;
                button.buttonContext = button.context;
                button.context = this;
                button.callback = function () {
                    this.close();
                    button.buttonCallback.call(button.buttonContext);
                };
            }.bind(this));
            this.modal = true;
            this.setCapture(true);
        },

        methods: {
            onLeftMouseUp: function (e) {
                this.close();
            }
        }
    });

}());
