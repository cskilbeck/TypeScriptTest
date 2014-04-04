//////////////////////////////////////////////////////////////////////

var ButtonList = (function () {
    "use strict";

    var ButtonList = function () {
        SpriteList.call(this);
        this.visible = true;
    };

    //////////////////////////////////////////////////////////////////////

    return Util.extendClass(SpriteList, ButtonList, {

        update: function () {
            this.forEach(function (b) {
                b.update();
            });
        }
    });

}());
