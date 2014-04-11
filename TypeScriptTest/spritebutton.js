//////////////////////////////////////////////////////////////////////

var SpriteButton = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var SpriteButton = function (image, type, x, y, click, hover, context) {
        Button.call(this, click, hover, context);
        Sprite.call(this, image);
        this.type = type;
        this.setPosition(x, y);
        this.origin = { x: x, y: y };
    };

    Util.extendClass(Sprite, SpriteButton);

    return Util.extendClass(Button, SpriteButton, {

        update: function () {
            Button.prototype.update.call(this);
        },

        onIdle: function () {
            switch (this.type) {
            case 'frame':
                this.setFrame(0);
                break;
            case 'offset':
                this.setPosition(this.origin.x, this.origin.y);
                break;
            case 'scale':
                this.setScale(1);
                break;
            }
        },

        onHover: function () {
            switch (this.type) {
            case 'frame':
                this.setFrame(1);
                break;
            case 'offset':
                this.setPosition(this.origin.x - 1, this.origin.y - 1);
                break;
            case 'scale':
                this.setScale(1.05);
                break;
            }
        },

        onPressed: function () {
            switch (this.type) {
            case 'frame':
                this.setFrame(2);
                break;
            case 'offset':
                this.setPosition(this.origin.x + 2, this.origin.y + 2);
                break;
            case 'scale':
                this.setScale(1.025);
                break;
            }
        }
    });

}());
