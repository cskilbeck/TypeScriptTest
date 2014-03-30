//////////////////////////////////////////////////////////////////////

var Orientation = {
    horizontal: 0,
    vertical: 1
};

//////////////////////////////////////////////////////////////////////

var Word = (function () {
    "use strict";

    var Word = function (str, x, y, orientation, score) {
        this.str = str;
        this.x = x;
        this.y = y;
        this.orientation = orientation;
        this.score = score;
    };

    Word.prototype = {
        compare: function (b) {
            if (this.score > b.score) {
                return true;
            }
            if (this.str.length > b.str.length) {
                return true;
            }
            return this.str > b.str;
        }
    };

    return Word;

}());

//////////////////////////////////////////////////////////////////////

