//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    chs.Rectangle = chs.Class({
        inherit$: [chs.Drawable],

        $: function (x, y, w, h, radius) {
            chs.Drawable.call(this);
            this.setPosition(x, y);
            this.dimensions = { width: w, height: h };
            this.radius = 0;
            if(radius !== undefined) {
                this.radius = radius;
            }
        },

        width: {
            set: function (w) {
                this.dimensions.width = w;
            },
            get: function () {
                return this.dimensions.width;
            }
        },

        height: {
            set: function (h) {
                this.dimensions.height = h;
            },
            get: function () {
                return this.dimensions.height;
            }
        },

        onDraw: function (context) {
            if(this.radius > 0) {
                chs.Util.roundRect(context, 0, 0, this.width, this.height, this.radius);
            } else {
                chs.Util.rect(context, 0, 0, this.width, this.height);
            }
        }
    });

    //////////////////////////////////////////////////////////////////////

    chs.ClipRect = chs.Class({
        inherit$: [chs.Rectangle],

        $: function (x, y, w, h, radius) {
            chs.Rectangle.call(this, x, y, w, h, radius);
        },

        onDraw: function (context) {
            chs.Rectangle.prototype.onDraw.call(this, context);
            context.clip();
        }
    });

    //////////////////////////////////////////////////////////////////////

    chs.SolidRectangle = chs.Class({
        inherit$: [chs.Rectangle],

        $: function (x, y, w, h, radius, fillColour) {
            chs.Rectangle.call(this, x, y, w, h, radius);
            this.fillColour = fillColour;
        },

        drawIt: function (context) {
            context.fillStyle = this.fillColour;
            context.fill();
        },

        onDraw: function (context) {
            chs.Rectangle.prototype.onDraw.call(this, context);
            this.drawIt(context);
        }
    });

    //////////////////////////////////////////////////////////////////////

    chs.OutlineRectangle = chs.Class({
        inherit$: [chs.Rectangle],

        $: function (x, y, w, h, radius, lineColour, lineWidth) {
            chs.Rectangle.call(this, x, y, w, h, radius);
            this.lineColour = lineColour;
            this.lineWidth = lineWidth === undefined ? 1 : lineWidth;
        },

        drawIt: function (context) {
            context.lineWidth = this.lineWidth;
            context.strokeStyle = this.lineColour;
            context.stroke();
        },

        onDraw: function (context) {
            chs.Rectangle.prototype.onDraw.call(this, context);
            this.drawIt(context);
        }
    });

    //////////////////////////////////////////////////////////////////////

    chs.Panel = chs.Class({
        inherit$: [chs.Rectangle],

        $: function (x, y, w, h, fillColour, lineColour, radius, lineWidth) {
            chs.Rectangle.call(this, x, y, w, h, radius);
            this.fillColour = fillColour;
            this.lineColour = lineColour;
            this.lineWidth = lineWidth || 1;
        },

        onDraw: function (context) {
            chs.Rectangle.prototype.onDraw.call(this, context);
            if (this.fillColour !== undefined) {
                chs.SolidRectangle.prototype.drawIt.call(this, context);
            }
            if (this.lineColour !== undefined) {
                chs.OutlineRectangle.prototype.drawIt.call(this, context);
            }
        }
    });

    //////////////////////////////////////////////////////////////////////

    chs.Line = chs.Class({
        inherit$: [chs.Drawable],

        $: function (x1, y1, x2, y2, colour, width) {
            chs.Drawable.call(this);
            this.x1 = x1;
            this.x2 = x2;
            this.y1 = y1;
            this.y2 = y2;
            this.colour = colour;
            this.lineWidth = width;
        },

        onDraw: function (context) {
            context.beginPath();
            context.moveTo(this.x1, this.y1);
            context.lineTo(this.x2, this.y2);
            context.strokeStyle = this.colour;
            context.lineWidth = this.lineWidth;
            context.stroke();
        }
    });

    //////////////////////////////////////////////////////////////////////

    chs.PanelButton = chs.Class({
        inherit$: [chs.Button, chs.Panel],

        $: function (x, y, w, h, fillColour, lineColour, radius, lineWidth, click, context) {
            chs.Button.call(this, click, context);
            chs.Panel.call(this, x, y, w, h, fillColour, lineColour, radius, lineWidth);
        }
    });

    //////////////////////////////////////////////////////////////////////

    chs.LinkButton = chs.Class({
        inherit$: [chs.Button, chs.Line],

        $: function (x1, y1, x2, y2, link, click, context) {
            var l = Math.floor(x1) + 0.5,
                r = Math.floor(x2) + 0.5,
                t = Math.floor(y1) + 0.5,
                b = Math.floor(y2) + 0.5,
                h = b - t,
                w = r - l;
            chs.Line.call(this, 0, h, w, h, "skyblue", 2);
            chs.Button.call(this, function () {
                if (this.linkClicked) {
                    this.linkClicked.call(this.clickContext, this.link);
                }
            }, this);
            this.clickContext = context;
            this.link = link;
            this.linkClicked = click;
            this.setPosition(l, t);
            this.dimensions = { width: w, height: h };
        },
        onIdle: function () { this.colour = "skyblue"; },
        onHover: function () { this.colour = "red"; },
        onPressed: function () { this.colour = "white"; }
    });

}());