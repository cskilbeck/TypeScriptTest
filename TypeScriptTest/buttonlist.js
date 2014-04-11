//////////////////////////////////////////////////////////////////////

var ButtonList = (function () {
    "use strict";

    var ButtonList = function () {
        LinkedList.call(this, "buttonListNode");
    };

    //////////////////////////////////////////////////////////////////////

    return Util.extendClass(LinkedList, ButtonList, {

        draw: function (context) {
            this.forEach(function (b) {
                b.draw(context);
            });
        },

        update: function () {
            this.forEach(function (b) {
                b.update();
            });
        },

        add: LinkedList.prototype.pushFront

    });

}());
