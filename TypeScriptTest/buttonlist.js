//////////////////////////////////////////////////////////////////////

var ButtonList = (function () {
    "use strict";

    var ButtonList = function () {
        SpriteList.call(this);
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
