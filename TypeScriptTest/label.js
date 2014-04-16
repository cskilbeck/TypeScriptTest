//////////////////////////////////////////////////////////////////////

chs.Label = (function () {
    "use strict";

    var Label = function (text, font, lineSpace, softLineSpace) {
        chs.Drawable.call(this);
        this.labelData = {
            text: text,
            font: font,
            lineSpace: lineSpace,
            softLineSpace: softLineSpace,
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

        size: function (links) {
            var self = this.labelData;
            if (self.dimensions === null) {
                self.dimensions = self.font.measureText(self.text, self.lineSpace, self.softLineSpace, links);
            }
            return self.dimensions;
        },

        onDraw: function (context) {
            var self = this.labelData;
            self.font.renderString(context, self.text, 0, 0, self.lineSpace, self.softLineSpace);
        }
    });

}());

chs.TextBox = (function () {
    "use strict";

    var TextBox = function (x, y, w, h, text, font, lineBreak, lineSpace, softLineSpace, linkClicked, context) {
        var str = font.wrapText(text, w, lineBreak, lineSpace, softLineSpace),
            links = [],
            link,
            linkClickedCallback = function (link) {
                if (this.linkClicked !== undefined) {
                    this.linkClicked.call(context, link);
                }
            };
        chs.Label.call(this, str, font, lineSpace, softLineSpace);
        this.setPosition(x, y);
        this.dimensions = { width: w, height: h };
        this.linkClicked = linkClicked;
        font.measureText(str, lineSpace, softLineSpace, links);
        while (links.length > 0) {
            link = new chs.LinkButton(links.shift(), links.shift() - 2, links.shift(), links.shift() - 2, links.shift(), linkClickedCallback, this);
            link.transparency = 192;
            this.addChild(link);
        }
    };

    chs.extend(TextBox, chs.Label);

    return chs.override(TextBox, {

    });

}());