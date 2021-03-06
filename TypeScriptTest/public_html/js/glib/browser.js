(function () {
    "use strict";

    function id() {
        var ua = navigator.userAgent,
            tem,
            M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'MSIE ' + (tem[1] || '');
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\bOPR\/(\d+)/);
            if (tem !== null) {
                return 'Opera ' + tem[1];
            }
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        tem = ua.match(/version\/(\d+)/i);
        if (tem !== null) {
            M.splice(1, 1, tem[1]);
        }
        return M.join(' ');
    }

    var browser = id().split(' ');

    glib.Browser = {

        type: browser[0],
        version: parseInt(browser[1], 10)
    };

}());
