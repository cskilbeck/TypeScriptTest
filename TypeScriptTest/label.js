//////////////////////////////////////////////////////////////////////

chs.Label = (function () {
    "use strict";

    var Label = function (text, font, lineSpace) {
        chs.Drawable.call(this);
        this.labelData = {
            text: text,
            font: font,
            lineSpace: lineSpace,
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
        }
    });

    Object.defineProperty(Label.prototype, "font", {
        get: function () {
            return this.labelData.font;
        },
        set: function (f) {
            this.labelData.font = f;
            this.labelData.dimensions = null;
        }
    });

    chs.Util.extendPrototype(Label, chs.Drawable);

    return chs.Util.overridePrototype(Label, {

        size: function () {
            var self = this.labelData;
            if (self.dimensions === null) {
                self.dimensions = self.font.measureText(self.text, self.lineSpace);
            }
            return self.dimensions;
        },

        onDraw: function (context) {
            var self = this.labelData;
            self.font.renderString(context, self.text, 0, 0, self.lineSpace);
        }
    });

}());