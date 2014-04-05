//////////////////////////////////////////////////////////////////////

var Debug = (function () {
    "use strict";

    function debugEntry(x, y, str) {
        return {
            x: x,
            y: y,
            str: str
        };
    }

    var font = new Font("Fixedsys"),
        debugEntries = [],

        Debug = {

            context: null,

            text: function (x, y, str) {
                debugEntries.push(debugEntry(x, y, str));
            },

            draw: function () {
                var i,
                    dbe;
                for (i = 0; i < debugEntries.length; ++i) {
                    dbe = debugEntries[i];
                    font.drawText(this.context, dbe.x, dbe.y, dbe.str);
                }
                debugEntries.length = 0;
            },

            log: function (str) {
                console.log(str);
            }
        };

    return Debug;
}());
