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

    glib.Label = glib.Class({ inherit$: [glib.Composite, glib.Drawable],

        $: function (text, font) {
            glib.Drawable.call(this);
            glib.Composite.call(this);
            this.labelData = {
                text: text,
                font: font,
                extent: null
            };
            measureText.call(this);
            this.compose();
        },

        text: glib.Property({
            configurable: true,
            get: function () {
                return this.labelData.text;
            },
            set: function (s) {
                if (this.labelData.text !== s) {
                    this.labelData.text = s;
                    measureText.call(this);
                    this.compose();
                }
            }
        }),

        font: glib.Property({
            get: function () {
                return this.labelData.font;
            },
            set: function (f) {
                if (this.labelData.font !== f) {
                    this.labelData.font = f;
                    measureText.call(this);
                    this.compose();
                }
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

    glib.TextBox = glib.Class({ inherit$: glib.ClipRect,

        $: function (x, y, w, h, text, font, lineBreak, linkClicked, context) {
            glib.ClipRect.call(this, x, y, w, h, 0);
            if (linkClicked) {
                this.links = new glib.Drawable();
                this.addChild(this.links);
            }
            this.label = new glib.Label(text, font);
            this.addChild(this.label);
            this.context = context;
            this.setPosition(x, y);
            this.linkClicked = linkClicked;
            this.lineBreak = lineBreak || '\r';
            this.text = text;
        },

        text: glib.Property({
            set: function (s) {
                var links = [],
                    link;
                this.label.text = this.label.font.wrapText(s, this.width, this.lineBreak);
                if (this.linkClicked) {
                    this.label.font.measureText(this.label.text, links);
                    this.links.removeChildren();
                    while (links.length > 0) {
                        link = new glib.LinkButton(links.shift(),
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

