//////////////////////////////////////////////////////////////////////

var SpriteList = (function () {
    "use strict";

    var SpriteList = function (listNodeName) {
        LinkedList.call(this, listNodeName || 'spriteListNode');
    };

    //////////////////////////////////////////////////////////////////////

    return Util.extendClass(LinkedList, SpriteList, {

        draw : function (context) {
            context.save();
            this.reverseForEach(function (s) {
                s.draw(context);
            });
            context.restore();
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
