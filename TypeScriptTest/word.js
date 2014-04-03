//////////////////////////////////////////////////////////////////////

var Orientation = {
    horizontal: 0,
    vertical: 1
};

//////////////////////////////////////////////////////////////////////

var Word = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Word = function (str, x, y, orientation, score) {
        this.str = str;
        this.x = x;
        this.y = y;
        this.orientation = orientation;
        this.score = score;
        this.index = 0;
        this.listNode = listNode(this);
    };

    //////////////////////////////////////////////////////////////////////
    // words are sorted by score then length then alphabetically

    Word.prototype = {

        toString: function () {
            return this.str + "(" + this.score.toString() + ")";
        }
    };

    return Word;

}());

//////////////////////////////////////////////////////////////////////

