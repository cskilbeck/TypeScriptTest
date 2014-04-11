//////////////////////////////////////////////////////////////////////

var Button = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var idle = 0,
        hover = 1,
        pressed = 2;

    //////////////////////////////////////////////////////////////////////

    function Button(clicked, context, border) {
        this.enabled = true;
        this.state = idle;
        this.clicked = clicked;
        this.context = context;
        this.border = border || 2;
        this.buttonListNode = listNode(this);
    }

    //////////////////////////////////////////////////////////////////////

    Button.prototype = {

        onHover: function () {

        },

        onIdle: function () {

        },

        onPressed: function () {
        },

        update: function () {
            this.transparency = this.enabled ? 255 : 128;
            if (this.visible && this.enabled) {
                switch (this.state) {
                case idle:
                    if (!Mouse.left.held && this.pick(Mouse.position, this.border)) {
                        this.onHover();
                        this.state = hover;
                    }
                    break;
                case hover:
                    if (!this.pick(Mouse.position, this.border)) {
                        this.onIdle();
                        this.state = idle;
                    } else if (Mouse.left.pressed) {
                        this.onPressed();
                        this.state = pressed;
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
