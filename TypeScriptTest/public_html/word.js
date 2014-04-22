//////////////////////////////////////////////////////////////////////

var Word = (function () {
    "use strict";

    return chs.Class({
        
        static$: {
            horizontal: 0,
            vertical: 1
        },

        $: function (str, x, y, orientation, score) {
            this.str = str;
            this.x = x;
            this.y = y;
            this.orientation = orientation;
            this.score = score;
            this.index = 0;
            this.listNode = chs.List.Node(this);
        },

        toString: function () {
            return this.str + "(" + this.score.toString() + ")";
        }
    });

}());

//////////////////////////////////////////////////////////////////////

