//////////////////////////////////////////////////////////////////////

var ajax = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    function send(url, callback, progressCallback, context, method, data, mimetype) {

        var xr,
            t;
        xr = new XMLHttpRequest();
        xr.open(method, url);
        if (mimetype != null) {
            xr.overrideMimeType(mimetype);
        }
        xr.onreadystatechange = function () {
            if (xr.readyState === XMLHttpRequest.DONE) {
                callback.call(context, xr.responseText);
            }
        };
        xr.onprogress = function (e) {
            progressCallback.call(context, e.loaded, e.lengthComputable ? e.total : 0);
        };
        if (method === 'POST') {
            xr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        }
        xr.send(data);
        return xr;
    }

    //////////////////////////////////////////////////////////////////////

    var ajax = {

        //////////////////////////////////////////////////////////////////////

        get: function (url, data, callback, progressCallback, context, mimetype) {

            var query = [],
                key;
            for (key in data) {
                query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
            }
            return send(url + '?' + query.join('&'), callback, progressCallback, context, 'GET', null, mimetype);
        },

        //////////////////////////////////////////////////////////////////////

        post: function (url, data, callback, progressCallback, context, mimeType) {

            var query = [],
                key;
            for (key in data) {
                query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
            }
            return send(url, callback, progressCallback, context, 'POST', query.join('&'), mimeType);
        }
    };

    return ajax;
}());

//////////////////////////////////////////////////////////////////////
