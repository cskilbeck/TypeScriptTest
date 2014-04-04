//////////////////////////////////////////////////////////////////////

var ajax = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    function send(url, callback, context, method, data) {

        var xr = new XMLHttpRequest();
        xr.open(method, url);
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

        get: function (url, data, callback, context) {

            var query = [],
                key;
            for (key in data) {
                query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
            }
            send(url + '?' + query.join('&'), callback, context, 'GET', null);
        },

        //////////////////////////////////////////////////////////////////////

        post: function (url, data, callback, context) {

            var query = [],
                key;
            for (key in data) {
                query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
            }
            send(url, callback, context, 'POST', query.join('&'));
        }
    };

    return ajax;
}());

//////////////////////////////////////////////////////////////////////
