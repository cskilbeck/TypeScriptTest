//////////////////////////////////////////////////////////////////////

chs.Rectangle = (function () {

    "use strict";

    var Rectangle = function (x, y, w, h, radius) {
        chs.Drawable.call(this);
        this.setPosition(x, y);
        this.dimensions = { width: w, height: h };
        this.radius = radius;
    };

    chs.extend(Rectangle, chs.Drawable);

    return chs.override(Rectangle, {
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
            chs.Util.roundRect(context, 0, 0, this.width, this.height, this.radius);
        }
    });

}());

//////////////////////////////////////////////////////////////////////

chs.ClipRect = (function () {
    "use strict";

    var ClipRect = function (x, y, w, h, radius) {
        chs.Rectangle.call(this, x, y, w, h, radius);
    };
    
    chs.extend(ClipRect, chs.Rectangle);

    return chs.override(ClipRect, {

        onDraw: function (context) {
            chs.Rectangle.prototype.onDraw.call(this, context);
            context.clip();
        }
    });

}());

//////////////////////////////////////////////////////////////////////

chs.Panel = (function () {
    "use strict";

    var Panel = function (x, y, w, h, fillColour, outlineColour, radius, lineWidth, lineTransparency) {
        chs.Rectangle.call(this, x, y, w, h, radius);
        this.fillColour = fillColour;
        this.lineColour = outlineColour;
        this.lineWidth = lineWidth;
        this.lineTransparency = lineTransparency;
    };

    //////////////////////////////////////////////////////////////////////

    chs.extend(Panel, chs.Rectangle);
    
    return chs.override(Panel, {

        onDraw: function (context) {
            chs.Rectangle.prototype.onDraw.call(this, context);
            if (this.fillColour !== undefined) {
                context.fillStyle = this.fillColour;
                context.fill();
            }
            if (this.lineColour !== undefined) {
                context.strokeStyle = this.lineColour;
                context.lineWidth = this.lineWidth || 1;
                context.globalAlpha = (this.lineTransparency || 255) / 255.0;
                context.stroke();
            }
        }
    });

}());

//////////////////////////////////////////////////////////////////////

chs.Line = (function () {
    "use strict";

    var Line = function (x1, y1, x2, y2, colour, width) {
        chs.Drawable.call(this);
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
        this.colour = colour;
        this.lineWidth = width;
    };

    chs.extend(Line, chs.Drawable);

    return chs.override(Line, {

        onDraw: function (context) {
            context.beginPath();
            context.moveTo(this.x1, this.y1);
            context.lineTo(this.x2, this.y2);
            context.strokeStyle = this.colour;
            context.lineWidth = this.lineWidth;
            context.stroke();
        }
    });

}());

//////////////////////////////////////////////////////////////////////

chs.PanelButton = (function () {
    "use strict";

    var PanelButton = function (x, y, w, h, fillColour, lineColour, radius, lineWidth, click, context) {
        chs.Panel.call(this, x, y, w, h, fillColour, lineColour, radius, lineWidth);
        chs.Button.call(this, click, context);
    };

    chs.extend(PanelButton, chs.Button);
    chs.extend(PanelButton, chs.Panel);

    return PanelButton;

}());

//////////////////////////////////////////////////////////////////////

chs.LinkButton = (function () {
    "use strict";

    var onLinkClicked = function () {
            if (this.linkClicked !== undefined) {
                this.linkClicked.call(this.clickContext, this.link);
            }
        },

        LinkButton = function (x1, y1, x2, y2, link, click, context) {
            var l = Math.floor(x1) + 0.5,
                r = Math.floor(x2) + 0.5,
                t = Math.floor(y1) + 0.5,
                b = Math.floor(y2) + 0.5,
                h = b - t,
                w = r - l;
            chs.Line.call(this, 0, h, w, h, "lightblue", 1);
            chs.Button.call(this, onLinkClicked, this);
            this.clickContext = context;
            this.link = link;
            this.linkClicked = click;
            this.setPosition(l, t);
            this.dimensions = { width: w, height: h };
        };

    chs.extend(LinkButton, chs.Button);
    chs.extend(LinkButton, chs.Line);

    return chs.override(LinkButton, {
        onIdle: function () { this.colour = "lightblue"; },
        onHover: function () { this.colour = "cyan"; },
        onPressed: function () { this.colour = "red"; }
    });

}());