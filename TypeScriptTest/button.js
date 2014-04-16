//////////////////////////////////////////////////////////////////////

chs.Button = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var idle = 0,
        hover = 1,
        pressed = 2;

    //////////////////////////////////////////////////////////////////////

    function Button(click, context) {
        this.enabled = true;
        this.state = idle;
        this.clicked = click;
        this.context = context || this;
    }

    //////////////////////////////////////////////////////////////////////

    Button.prototype = {

        onHover: function () {

        },

        onIdle: function () {

        },

        onPressed: function () {
        },

        onMouseEnter: function () {
            this.state = hover;
            this.onHover();
            return true;
        },

        onMouseLeave: function () {
            this.state = idle;
            this.onIdle();
            return true;
        },

        onLeftMouseDown: function () {
            this.state = pressed;
            this.onPressed();
            return true;
        },

        onLeftMouseUp: function () {
            if (this.state === pressed) {
                if (this.clicked !== undefined) {
                    this.clicked.call(this.context || this);
                }
            }
            this.onHover();
            this.state = hover;
            return true;
        }
    };

    return Button;

}());
