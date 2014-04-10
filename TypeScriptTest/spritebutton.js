//////////////////////////////////////////////////////////////////////

var SpriteButton = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var SpriteButton = function (image, x, y, clicked, context) {
        Button.call(this, clicked, context);
        Sprite.call(this, image);
        this.setPosition(x, y);
    };

    Util.extendClass(Button, SpriteButton);
    Util.extendClass(Sprite, SpriteButton);

    return SpriteButton;

}());
