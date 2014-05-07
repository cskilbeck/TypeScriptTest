//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    chs.Menu = chs.Class({
        inherit$: [chs.Drawable],

        // callback can be a function or an array of functions
        $: function (x, y, font, items, callback, context) {
            var i,
                ht = font.height,
                w = 0,
                h,
                yp = 0,
                item,
                clip,
                ftb,
                cb;
            for (i = 0; i < items.length; ++i) {
                item = items[i];
                w = Math.max(w, font.measureText(item).width + 8);
            }
            w += 32;
            h = (font.height + 16) * items.length;
            chs.Drawable.call(this);
            this.setPosition(x, y);
            this.dimensions = { width: w, height: h };
            this.clip = new chs.ClipRect(0, 0, w, h, 6);
            this.addChild(this.clip);
            this.transparency = 224;
            this.font = font;
            this.setPosition(x, y);
            this.buttons = [];
            i = 0;
            items.forEach(function (item) {
                var align = item[0],
                    xpivot = 0.5,
                    ypivot = 0.5,
                    txt;
                if (align !== '<' && align !== '>' && align !== '\\') {
                    txt = item;
                } else {
                    txt = item.slice(1);
                }
                ftb = new chs.TextButton(txt, font, 0, yp, w, font.height + 16, function () {
                    this.state = chs.Button.idle;
                    this.parent.parent.dispatchEvent('chosen');
                    if (Array.isArray(callback)) {
                        cb = callback[this.index % callback.length];
                        if (cb) {
                            cb.call(context, this.index);
                        }
                    } else if (callback) {
                        callback.call(context, this.index);
                    }
                }, null, 0);
                ftb.index = i++;
                ftb.lineColour = "white";
                ftb.lineTransparency = 255;
                ftb.onIdle = function () { this.panel.fillColour = 'black'; this.panel.transparency = 192; };
                ftb.onHover = function () { this.panel.fillColour = 'slategrey'; this.panel.transparency = 255; };
                ftb.onPressed = function () { this.panel.fillColour = 'darkslategrey'; this.panel.transparency = 255; };
                ftb.panel.fillColour = 'black';
                ftb.panel.transparency = 192;
                switch (align) {
                case '<':
                    ftb.label.setPivot(0, font.midPivot);
                    ftb.label.setPosition(8, ftb.height / 2);
                    break;
                case '>':
                    ftb.label.setPivot(1, font.midPivot);
                    ftb.label.setPosition(ftb.width - 8, ftb.height / 2);
                    break;
                }
                this.clip.addChild(ftb);
                yp += font.height + 16;
                this.buttons.push(ftb);
            }, this);
            this.addChild(new chs.OutlineRectangle(0, 0, w, h, 6, "white", 3)); // border
        }
    });

    //////////////////////////////////////////////////////////////////////

    chs.PopupMenu = chs.Class({
        inherit$: [chs.Menu],

        $: function (x, y, font, items, callback, context) {
            chs.Menu.call(this, x, y, font, items, callback, context);
            this.addEventHandler('chosen', this.close, this);
            this.addEventHandler('leftMouseUp', this.close, this);
            this.modal = true;
            this.setCapture(true);
        }
    });

}());
