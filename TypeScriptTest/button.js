//////////////////////////////////////////////////////////////////////

var Button = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var idle = 0,
        hover = 1,
        pressed = 2;

    //////////////////////////////////////////////////////////////////////

    function Button(clicked, context) {
        this.enabled = true;
        this.state = idle;
        this.clicked = clicked;
        this.context = context;
    }

    //////////////////////////////////////////////////////////////////////

    Button.prototype = {

        update: function () {
            this.transparency = this.enabled ? 255 : 128;
            if (this.visible && this.enabled) {
                switch (this.state) {
                case idle:
                    if (!Mouse.left.held && this.pick(Mouse.position, 2)) {
                        this.state = hover;
                    }
                    break;
                case hover:
                    if (!this.pick(Mouse.position, 2)) {
                        this.state = idle;
                    } else if (Mouse.left.pressed) {
                        this.move(2, 2);
                        this.state = pressed;
                    }
                    break;
                case pressed:
                    if (!this.pick(Mouse.position, 4)) {
                        this.move(-2, -2);
                        this.state = idle;
                    } else {
                        if (Mouse.left.released) {
                            if (this.clicked) {
                                this.clicked.call(this.context);
                            }
                            this.move(-2, -2);
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
