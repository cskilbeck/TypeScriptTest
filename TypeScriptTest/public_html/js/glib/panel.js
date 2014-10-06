//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////
    //@class: glib.Rectangle
    //@description: base class for various rectangular objects
    //@inherits: >glib.Drawable

    glib.Rectangle = glib.Class({ inherit$: glib.Drawable,

        //@function: constructor
        //@input: x number
        //@input: y number
        //@input: w number
        //@input: h number
        //@input: radius [number|array] radius of corners, can be a single number or an array for topleft, topright, bottomright, bottomleft
        $: function (x, y, w, h, radius) {
            glib.Drawable.call(this);
            this.setPosition(x, y);
            this.size = { width: w, height: h };
            this.radius = (radius === undefined) ? 0 : radius;
            this.fancy = glib.Util.isArray(this.radius);
        },

        //@function: onDraw
        //@description: sets up the context, but draws nothing
        //@input: context canvas context2D
        onDraw: function (context) {
            if (this.fancy) {
                glib.Util.fancyRect(context, 0, 0, this.width, this.height, this.radius);
            }
            else if (this.radius > 0) {
                glib.Util.roundRect(context, 0, 0, this.width, this.height, this.radius);
            } else {
                glib.Util.rect(context, 0, 0, this.width, this.height);
            }
        }
    });

    //////////////////////////////////////////////////////////////////////
    //@class: glib.ClipRect
    //@description: set up a clipping rectangle for child objects
    //@inherits: >glib.Rectangle

    glib.ClipRect = glib.Class({ inherit$: glib.Rectangle,

        //@function: constructor
        //@description: see >glib.Rectangle constructor
        //@input: x number
        //@input: y number
        //@input: w number
        //@input: h number
        //@input: radius [number|array] radius of corners, can be a single number or an array for topleft, topright, bottomright, bottomleft
        $: function (x, y, w, h, radius) {
            glib.Rectangle.call(this, x, y, w, h, radius);
        },

        onDraw: function (context) {
            glib.Rectangle.prototype.onDraw.call(this, context);
            context.clip();
        }
    });

    //////////////////////////////////////////////////////////////////////
    //@class: glib.SolidRectangle
    //@description: a rectangle of solid colour
    //@inherits: >glib.Rectangle

    glib.SolidRectangle = glib.Class({ inherit$: glib.Rectangle,

        //@function: constructor
        //@input: x number
        //@input: y number
        //@input: w number
        //@input: h number
        //@input: radius [number|array] radius of corners, can be a single number or an array for topleft, topright, bottomright, bottomleft
        //@input: fillColour string any valid context fill string (colour name, rgb(r,g,b), gradient)
        $: function (x, y, w, h, radius, fillColour) {
            glib.Rectangle.call(this, x, y, w, h, radius);
            this.fillColour = fillColour;
        },

        drawIt: function (context) {
            context.fillStyle = this.fillColour;
            context.fill();
        },

        onDraw: function (context) {
            glib.Rectangle.prototype.onDraw.call(this, context);
            this.drawIt(context);
        }
    });

    //////////////////////////////////////////////////////////////////////

    glib.OutlineRectangle = glib.Class({ inherit$: glib.Rectangle,

        $: function (x, y, w, h, radius, lineColour, lineWidth) {
            glib.Rectangle.call(this, x, y, w, h, radius);
            this.lineColour = lineColour;
            this.lineWidth = lineWidth === undefined ? 1 : lineWidth;
        },

        drawIt: function (context) {
            context.lineWidth = this.lineWidth;
            context.strokeStyle = this.lineColour;
            context.stroke();
        },

        onDraw: function (context) {
            glib.Rectangle.prototype.onDraw.call(this, context);
            this.drawIt(context);
        }
    });

    //////////////////////////////////////////////////////////////////////

    glib.Panel = glib.Class({ inherit$: glib.Rectangle,

        $: function (x, y, w, h, fillColour, lineColour, radius, lineWidth) {
            glib.Rectangle.call(this, x, y, w, h, radius);
            this.fillColour = fillColour;
            this.lineColour = lineColour;
            this.lineWidth = lineWidth || 1;
        },

        onDraw: function (context) {
            glib.Rectangle.prototype.onDraw.call(this, context);
            if (this.fillColour !== undefined) {
                glib.SolidRectangle.prototype.drawIt.call(this, context);
            }
            if (this.lineColour !== undefined) {
                glib.OutlineRectangle.prototype.drawIt.call(this, context);
            }
        }
    });

    //////////////////////////////////////////////////////////////////////

    glib.Line = glib.Class({ inherit$: glib.Drawable,

        $: function (x1, y1, x2, y2, colour, width) {
            glib.Drawable.call(this);
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

    glib.PanelButton = glib.Class({ inherit$: [glib.Button, glib.Composite, glib.Panel],

        $: function (x, y, w, h, fillColour, lineColour, radius, lineWidth, click, context) {
            glib.Button.call(this, click, context);
            glib.Composite.call(this);
            glib.Panel.call(this, x, y, w, h, fillColour, lineColour, radius, lineWidth);
        }
    });

    //////////////////////////////////////////////////////////////////////

    glib.LinkButton = glib.Class({ inherit$: [glib.Button, glib.Line],

        $: function (x1, y1, x2, y2, link, click, context) {
            var l = Math.floor(x1) + 0.5,
                r = Math.floor(x2) + 0.5,
                t = Math.floor(y1) + 0.5,
                b = Math.floor(y2) + 0.5,
                h = b - t,
                w = r - l;
            glib.Line.call(this, 0, h, w, h, "skyblue", 2);
            glib.Button.call(this, function () {
                if (this.linkClicked) {
                    this.linkClicked.call(this.clickContext, this.link);
                }
            }, this);
            this.clickContext = context;
            this.link = link;
            this.linkClicked = click;
            this.setPosition(l, t);
            this.size = { width: w, height: h };
        },
        onIdle: function () { this.colour = "skyblue"; },
        onHover: function () { this.colour = "red"; },
        onPressed: function () { this.colour = "white"; }
    });

}());