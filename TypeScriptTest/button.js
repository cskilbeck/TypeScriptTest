//////////////////////////////////////////////////////////////////////

var ButtonList = (function () {
    "use strict";

    var ButtonList = function () {
        SpriteList.call(this);
        this.visible = true;
    };

    ButtonList.prototype = Object.create(SpriteList.prototype);

    ButtonList.prototype.update = function () {
        this.forEach(function (b) {
            b.update();
        });
    };

    return ButtonList;

}());

//////////////////////////////////////////////////////////////////////

var Button = (function () {
    "use strict";

    var idle = 0,
        hover = 1,
        pressed = 2;

    function Button(img, x, y, clicked, context) {
        Sprite.call(this, img);
        this.x = x;
        this.y = y;
        this.enabled = true;
        this.state = idle;
        this.clicked = clicked;
        this.context = context;
    }

    Button.prototype = Object.create(Sprite.prototype);

    Button.prototype.update = function () {

        this.transparency = this.enabled ? 255 : 128;

        if (this.loaded() && this.visible && this.enabled) {
            switch (this.state) {
            case idle:
                this.scaleX = 1;
                this.scaleY = 1;
                if (!Mouse.left.held && this.pick(Mouse.position)) {
                    this.state = hover;
                }
                break;
            case hover:
                this.scaleX = 1.1;
                this.scaleY = 1.1;
                if (!this.pick(Mouse.position)) {
                    this.state = idle;
                } else if (Mouse.left.pressed) {
                    this.state = pressed;
                }
                break;
            case pressed:
                this.scaleX = 1.25;
                this.scaleY = 1.25;
                if (!this.pick(Mouse.position)) {
                    this.state = idle;
                } else if (Mouse.left.released) {
                    this.clicked.call(this.context);
                    this.state = hover;
                }
                break;
            }
        }
    };

    return Button;

}());
