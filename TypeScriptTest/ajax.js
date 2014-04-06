//////////////////////////////////////////////////////////////////////

var ajax = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    function send(url, callback, progressCallback, context, method, data, binary) {

        var xr;
        xr = new XMLHttpRequest();
        xr.open(method, url);
        if (binary) {
            xr.responseType = 'arraybuffer';
        }
        xr.onreadystatechange = function () {
            if (xr.readyState === XMLHttpRequest.DONE) {
                if (binary) {
                    callback.call(context, url, new Uint8Array(this.response));
                } else {
                    callback.call(context, url, xr.responseText);
                }
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

        get: function (url, callback, progressCallback, context, binary) {

            send(url, callback, progressCallback, context, 'GET', null, binary);
        },

        //////////////////////////////////////////////////////////////////////

        post: function (url, data, callback, progressCallback, context, binary) {

            var query = [],
                key;
            for (key in data) {
                query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
            }
            send(url, callback, progressCallback, context, 'POST', query.join('&'), binary);
        }
    };

    return ajax;
}());

//////////////////////////////////////////////////////////////////////
