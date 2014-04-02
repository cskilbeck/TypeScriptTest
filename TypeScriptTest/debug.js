//////////////////////////////////////////////////////////////////////

var Debug = (function () {
    "use strict";

    var font = new Font(Fixedsys),

        Debug = {

            context: null,

            text: function (x, y, str) {
                font.drawText(this.context, x, y, str);
            },

            log: function (str) {
                console.log(str);
            }
        };

    return Debug;
}());
