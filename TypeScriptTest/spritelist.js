//////////////////////////////////////////////////////////////////////

var SpriteList = (function () {
    "use strict";

    var SpriteList = function (listNodeName) {
        LinkedList.call(this, listNodeName || 'spriteListNode');
    };

    //////////////////////////////////////////////////////////////////////

    return Util.extendClass(LinkedList, SpriteList, {

        draw : function (context) {
            this.reverseForEach(function (s) {
                s.draw(context);
            });
        },

        //////////////////////////////////////////////////////////////////////

        sort : function () {
            LinkedList.prototype.sort.call(function (a, b) {
                return a.zIndex - b.zIndex;
            });
        },

        //////////////////////////////////////////////////////////////////////

        add: LinkedList.prototype.pushFront,
        addToBack: LinkedList.prototype.pushBack
    });

}());
