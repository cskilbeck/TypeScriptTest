//////////////////////////////////////////////////////////////////////

var Button = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var idle = 0,
        hover = 1,
        pressed = 2;

    //////////////////////////////////////////////////////////////////////

    function Button(click, hover, context, border) {
        this.enabled = true;
        this.state = idle;
        this.clicked = click;
        this.hovered = hover;
        this.context = context || this;
        this.border = border || 2;
        this.hoverTime = 0;
    }

    //////////////////////////////////////////////////////////////////////

    Button.prototype = {

        onHover: function () {

        },

        onIdle: function () {

        },

        onPressed: function () {
        },

        onUpdate: function (deltaTime) {
            if (this.visible && this.enabled) {
                switch (this.state) {
                case idle:
                    if (!Mouse.left.held && this.pick(Mouse.position, this.border)) {
                        this.onHover();
                        this.state = hover;
                        this.hoverTime = 0;
                    }
                    break;
                case hover:
                    if (!this.pick(Mouse.position, this.border)) {
                        if (this.hoverTime >= 0 && this.hover) {
                            this.hover.call(this.context, false);
                        }
                        this.onIdle();
                        this.state = idle;
                    } else if (Mouse.left.pressed) {
                        if (this.hoverTime >= 0 && this.hover) {
                            this.hover.call(this.context, false);
                        }
                        this.onPressed();
                        this.state = pressed;
                    } else {
                        this.hoverTime += deltaTime;
                        if (this.hoverTime > 1 && this.hover) {
                            this.hover.call(this.context, true);
                            this.hoverTime = NaN;
                        }
                    }
                    break;
                case pressed:
                    if (!this.pick(Mouse.position, this.border + 2)) {
                        this.onIdle();
                        this.state = idle;
                    } else {
                        if (Mouse.left.released) {
                            if (this.clicked) {
                                this.clicked.call(this.context);
                            }
                            this.onHover();
                            this.state = hover;
                        }
                    }
                    break;
                }
            }
        }
    };

    return Button;

}());
