//////////////////////////////////////////////////////////////////////

var Button = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var idle = 0,
        hover = 1,
        pressed = 2;

    //////////////////////////////////////////////////////////////////////

    function Button(name, loader, x, y, clicked, context) {
        Sprite.call(this, name, loader);
        this.setPosition(x, y);
        this.enabled = true;
        this.state = idle;
        this.clicked = clicked;
        this.context = context;
    }

    //////////////////////////////////////////////////////////////////////

    return Util.extendClass(Sprite, Button, {

        update: function () {
            this.transparency = this.enabled ? 255 : 128;
            if (this.visible && this.enabled) {
                switch (this.state) {
                case idle:
                    this.setScale(1);
                    if (!Mouse.left.held && this.pick(Mouse.position)) {
                        this.state = hover;
                    }
                    break;
                case hover:
                    this.setScale(1.25);
                    if (!this.pick(Mouse.position)) {
                        this.state = idle;
                    } else if (Mouse.left.pressed) {
                        this.state = pressed;
                    }
                    break;
                case pressed:
                    this.setScale(1.25);
                    if (!this.pick(Mouse.position)) {
                        this.setScale(1);
                        this.state = idle;
                    } else {
                        this.setScale(0.9);
                        if (Mouse.left.released) {
                            this.clicked.call(this.context);
                            this.state = hover;
                        }
                    }
                    break;
                }
            }
        }
    });

}());
