//////////////////////////////////////////////////////////////////////

chs.Label = (function () {
    "use strict";

    var Label = function (text, font) {
        chs.Drawable.call(this);
        this.labelData = {
            text: text,
            font: font,
            dimensions: null
        };
    };

    Object.defineProperty(Label.prototype, "text", {
        get: function () {
            return this.labelData.text;
        },
        set: function (s) {
            this.labelData.text = s;
            this.labelData.dimensions = null;
            this.drawableData.dirty = true;
        }
    });

    Object.defineProperty(Label.prototype, "font", {
        get: function () {
            return this.labelData.font;
        },
        set: function (f) {
            this.labelData.font = f;
            this.labelData.dimensions = null;
            this.drawableData.dirty = true;
        }
    });

    chs.extend(Label, chs.Drawable);

    return chs.override(Label, {

        size: function () {
            var self = this.labelData;
            if (self.dimensions === null) {
                self.dimensions = self.font.measureText(self.text);
            }
            return self.dimensions;
        },

        onDraw: function (context) {
            var self = this.labelData;
            self.font.renderString(context, self.text, 0, 0);
        }
    });

}());

chs.TextBox = (function () {
    "use strict";

    var TextBox = function (x, y, w, h, text, font, lineBreak, linkClicked, context) {
        chs.Label.call(this, text, font);
        this.context = context;
        this.setPosition(x, y);
        this.dimensions = { width: w, height: h };
        this.linkClicked = linkClicked;
        this.lineBreak = lineBreak;
        this.text = text;
    };

    TextBox.linkClickedCallback = function (link) {
        if (this.linkClicked !== undefined) {
            this.linkClicked.call(this.context, link);
        }
    };

    Object.defineProperty(TextBox.prototype, "text", {
        set: function (s) {
            var links = [],
                link,
                self = this.labelData;
            self.text = self.font.wrapText(s, this.width, this.lineBreak);
            self.font.measureText(self.text, links);
            this.removeChildren();
            while (links.length > 0) {
                link = new chs.LinkButton(links.shift(),
                    links.shift() - 2,
                    links.shift(),
                    links.shift() - 2,
                    links.shift(),
                    TextBox.linkClickedCallback,
                    this);
                link.transparency = 192;
                this.addChild(link);
            }
        },
        get: function (s) {
            return this.labelData.text;
        }
    });

    chs.extend(TextBox, chs.Label);

    return chs.override(TextBox, {
        size: function () {
            return this.dimensions;
        }
    });

}());