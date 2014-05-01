﻿//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    mtw.Word = chs.Class({
        
        static$: {
            horizontal: 0,
            vertical: 1
        },

        $: function (str, x, y, orientation) {
            this.str = str;
            this.x = x;
            this.y = y;
            this.orientation = orientation;
            this.score = mtw.Letters.getWordScore(str);
            this.index = 0;
            this.listNode = chs.List.Node(this);
        },

        toString: function () {
            return this.str + "(" + this.score.toString() + ")";
        }
    });

}());

//////////////////////////////////////////////////////////////////////
