//////////////////////////////////////////////////////////////////////

var Panel = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Panel = function (x, y, w, h, colour) {
        Drawable.call(this);
        this.position.x = x;
        this.position.y = y;
        this.dimensions = { width: w, height: h };
        this.colour = colour;
    };

    //////////////////////////////////////////////////////////////////////

    Panel.prototype = {

        //////////////////////////////////////////////////////////////////////

        size: function () {
            return this.dimensions;
        },

        //////////////////////////////////////////////////////////////////////

        onDraw: function (context) {
            context.fillStyle = this.colour;
            context.fillRect(0, 0, this.width, this.height);
        }
    };

    //////////////////////////////////////////////////////////////////////

    Util.extendPrototype(Panel, Drawable);

    //////////////////////////////////////////////////////////////////////

    Object.defineProperty(Panel.prototype, "width", {
        set: function (w) {
            this.dimensions.width = w;
        }
    });

    //////////////////////////////////////////////////////////////////////

    Object.defineProperty(Panel.prototype, "height", {
        set: function (h) {
            this.dimensions.height = h;
        }
    });

    //////////////////////////////////////////////////////////////////////

    return Panel;

}());

//////////////////////////////////////////////////////////////////////

var PanelButton = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var PanelButton = function (x, y, w, h, colour, click, hover, context, border) {
        Panel.call(this, x, y, w, h, colour);
        Button.call(this, click, hover, context, border);
    };

    //////////////////////////////////////////////////////////////////////

    PanelButton.prototype = {
        onUpdate: function (deltaTime) {
            Button.prototype.onUpdate.call(this, deltaTime);
        }
    };

    //////////////////////////////////////////////////////////////////////

    Util.extendPrototype(PanelButton, Button);
    Util.extendPrototype(PanelButton, Panel);

    return PanelButton;

}());