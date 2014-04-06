//////////////////////////////////////////////////////////////////////

var ajax = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    function send(url, callback, progressCallback, context, method, data, mimetype) {

        var xr;
        xr = new XMLHttpRequest();
        xr.open(method, url);
        if (mimetype !== null) {
            xr.overrideMimeType(mimetype);
        }
        xr.onreadystatechange = function () {
            if (xr.readyState === XMLHttpRequest.DONE) {
                callback.call(context, url, xr.responseText);
            }
        };
        xr.onprogress = function (e) {
            progressCallback.call(context, url, e);
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

        url: function (url, data) {
            var query = [],
                key;
            for (key in data) {
                query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
            }
            return url + (query.length > 0 ? ('?' + query.join('&')) : '');
        },

        //////////////////////////////////////////////////////////////////////

        get: function (url, callback, progressCallback, context, mimetype) {

            send(url, callback, progressCallback, context, 'GET', null, mimetype);
        },

        //////////////////////////////////////////////////////////////////////

        post: function (url, data, callback, progressCallback, context, mimeType) {

            var query = [],
                key;
            for (key in data) {
                query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
            }
            send(url, callback, progressCallback, context, 'POST', query.join('&'), mimeType);
        }
    };

    return ajax;
}());

//////////////////////////////////////////////////////////////////////
