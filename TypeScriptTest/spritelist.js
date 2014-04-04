//////////////////////////////////////////////////////////////////////

var SpriteList = (function () {
    "use strict";

    var SpriteList = function (listNodeName) {
        LinkedList.call(this, listNodeName || 'spriteListNode');
    };

    SpriteList.prototype = Object.create(LinkedList.prototype);

    //////////////////////////////////////////////////////////////////////

    SpriteList.prototype.draw = function (context) {
        context.save();
        this.reverseForEach(function (s) {
            s.draw(context);
        });
        context.restore();
    };

    //////////////////////////////////////////////////////////////////////

    SpriteList.prototype.reorder = function () {
        this.sort(function (a, b) {
            return a.zIndex - b.zIndex;
        });
    };

    //////////////////////////////////////////////////////////////////////

    SpriteList.prototype.isLoaded = function () {
        return this.reverseForEach(function (s) {
            return s.loaded();
        });
    };

    //////////////////////////////////////////////////////////////////////

    SpriteList.prototype.add = LinkedList.prototype.pushFront;
    SpriteList.prototype.addToBack = LinkedList.prototype.pushBack;

    return SpriteList;

}());
