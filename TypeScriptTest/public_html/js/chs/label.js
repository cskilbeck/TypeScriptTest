//////////////////////////////////////////////////////////////////////
(function () {
    "use strict";

    var measureText = function () {
        var self = this.labelData,
            p = this.drawableData.padding;
        self.extent = this.labelData.font.measureText(this.labelData.text);
        this.size = { width: self.extent.width, height: self.extent.height };
        p.left = -self.extent.left;
        p.top = -self.extent.top;
        p.right = self.extent.right - self.extent.width;
        p.bottom = self.extent.bottom - self.extent.height;
    };

    chs.Label = chs.Class({ inherit$: [chs.Composite, chs.Drawable],

        $: function (text, font) {
            chs.Drawable.call(this);
            chs.Composite.call(this);
            this.labelData = {
                text: text,
                font: font,
                extent: null
            };
            measureText.call(this);
            this.compose();
        },

        text: chs.Property({
            configurable: true,
            get: function () {
                return this.labelData.text;
            },
            set: function (s) {
                this.labelData.text = s;
                measureText.call(this);
                this.compose();
            }
        }),

        font: chs.Property({
            get: function () {
                return this.labelData.font;
            },
            set: function (f) {
                this.labelData.font = f;
                measureText.call(this);
                this.compose();
            }
        }),

        onDraw: function (context) {
            var self = this.labelData;
            self.font.renderString(context, self.text, 0.5, 0.5);
        }

    });

    var linkClickedCallback = function (link) {
        if (this.linkClicked !== undefined) {
            this.linkClicked.call(this.context, link);
        }
    };

    chs.TextBox = chs.Class({ inherit$: chs.ClipRect,

        $: function (x, y, w, h, text, font, lineBreak, linkClicked, context) {
            chs.ClipRect.call(this, x, y, w, h, 0);
            if (linkClicked) {
                this.links = new chs.Drawable();
                this.addChild(this.links);
            }
            this.label = new chs.Label(text, font);
            this.addChild(this.label);
            this.context = context;
            this.setPosition(x, y);
            this.linkClicked = linkClicked;
            this.lineBreak = lineBreak || '\r';
            this.text = text;
        },

        text: chs.Property({
            set: function (s) {
                var links = [],
                    link;
                this.label.text = this.label.font.wrapText(s, this.width, this.lineBreak);
                if (this.linkClicked) {
                    this.label.font.measureText(this.label.text, links);
                    this.links.removeChildren();
                    while (links.length > 0) {
                        link = new chs.LinkButton(links.shift(),
                            links.shift(),
                            links.shift(),
                            links.shift(),
                            links.shift(),
                            linkClickedCallback,
                            this);
                        link.transparency = 192;
                        this.links.addChild(link);
                    }
                }
            },
            get: function (s) {
                return this.label.text;
            }
        })
    });

}());
