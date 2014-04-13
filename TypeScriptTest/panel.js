//////////////////////////////////////////////////////////////////////

var Panel = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Panel = function (x, y, w, h, colour) {
        Drawable.call(this);
        this.setPosition(x, y);
        this.dim = { width: w, height: h };
        this.colour = colour;
    };

    //////////////////////////////////////////////////////////////////////

    Util.extendClass(Drawable, Panel, {

        //////////////////////////////////////////////////////////////////////

        size: function () {
            return this.dim;
        },

        //////////////////////////////////////////////////////////////////////

        onDraw: function (context) {
            context.fillStyle = this.colour;
            context.fillRect(-this.pivot.x * this.width(), -this.pivot.y * this.height(), this.width(), this.height());
        }
    });

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

    Util.extendClass(Panel, PanelButton);
    Util.extendClass(Button, PanelButton);

    return PanelButton;

}());