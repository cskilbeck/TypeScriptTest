//////////////////////////////////////////////////////////////////////

var ajax = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    function send(url, callback, context, method, data, sync) {

        var xr = new XMLHttpRequest();
        xr.open(method, url, sync);
        xr.onreadystatechange = function () {
            if (xr.readyState === XMLHttpRequest.DONE) {
                callback.call(context, xr.responseText);
            }
        };
        if (method === 'POST') {
            xr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        }
        xr.send(data);
    }

    //////////////////////////////////////////////////////////////////////

    var ajax = {

        //////////////////////////////////////////////////////////////////////

        get: function (url, data, callback, context, sync) {

            var query = [],
                key;
            for (key in data) {
                query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
            }
            send(url + '?' + query.join('&'), callback, context, 'GET', null, sync);
        },

        //////////////////////////////////////////////////////////////////////

        post: function (url, data, callback, context, sync) {

            var query = [],
                key;
            for (key in data) {
                query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
            }
            send(url, callback, context, 'POST', query.join('&'), sync);
        }
    };

    return ajax;
}());

//////////////////////////////////////////////////////////////////////
