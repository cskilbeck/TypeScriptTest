//////////////////////////////////////////////////////////////////////

var ajax = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    function send(url, callback, method, data, sync) {

        var xr = new XMLHttpRequest();
        xr.open(method, url, sync);
        xr.onreadystatechange = function () {
            if (xr.readyState === XMLHttpRequest.DONE) {
                callback(xr.responseText);
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

        get: function (url, data, callback, sync) {

            var query = [],
                key;
            for (key in data) {
                query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
            }
            send(url + '?' + query.join('&'), callback, 'GET', null, sync);
        },

        //////////////////////////////////////////////////////////////////////

        post: function (url, data, callback, sync) {

            var query = [],
                key;
            for (key in data) {
                query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
            }
            send(url, callback, 'POST', query.join('&'), sync);
        }
    };

    return ajax;
}());

//////////////////////////////////////////////////////////////////////
