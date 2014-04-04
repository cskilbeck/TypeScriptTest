//////////////////////////////////////////////////////////////////////

var Button = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var idle = 0,
        hover = 1,
        pressed = 2;

    //////////////////////////////////////////////////////////////////////

    function Button(img, x, y, clicked, context) {
        Sprite.call(this, img);
        this.position.x = x;
        this.position.y = y;
        this.enabled = true;
        this.state = idle;
        this.clicked = clicked;
        this.context = context;
    }

    //////////////////////////////////////////////////////////////////////

    return Util.extendClass(Sprite, Button, {

        setState: function (state) {
            this.state = state;
            switch (this.state) {
            case idle:
                this.setScale(1);
                break;
            case hover:
                this.setScale(1.2);
                break;
            case pressed:
                this.setScale(1.1);
                break;
            }
        },

        update: function () {
            this.transparency = this.enabled ? 255 : 128;
            if (this.loaded && this.visible && this.enabled) {
                switch (this.state) {
                case idle:
                    if (!Mouse.left.held && this.pick(Mouse.position)) {
                        this.setState(hover);
                    }
                    break;
                case hover:
                    if (!this.pick(Mouse.position)) {
                        this.setState(idle);
                    } else if (Mouse.left.pressed) {
                        this.setState(pressed);
                    }
                    break;
                case pressed:
                    if (!this.pick(Mouse.position)) {
                        this.setState(idle);
                    } else if (Mouse.left.released) {
                        this.clicked.call(this.context);
                        this.setState(hover);
                    }
                    break;
                }
            }
        }
    });

}());
