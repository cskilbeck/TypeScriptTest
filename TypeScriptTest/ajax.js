﻿//////////////////////////////////////////////////////////////////////

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
                console.log("ajax loaded " + url);
                if (binary) {
                    callback.call(context, url, Util.getResponseAsArray(xr));
                } else {
                    callback.call(context, url, xr.responseText);
                }
            }
        };
        xr.onprogress = function (e) {
            console.log("ajax progress (" + e.total + ") : " + url);
            progressCallback.call(context, url, e);
        };
        if (method === 'POST') {
            xr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        }
        xr.send(data);
        return xr;
    }

    //////////////////////////////////////////////////////////////////////

    return {

        //////////////////////////////////////////////////////////////////////

        url: function (url, data, force) {
            var query = [],
                key,
                u,
                q = "",
                a = "?";
            for (key in data) {
                query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
                q = "?";
                a = "&";
            }
            u = url + q + query.join('&') + (force ? (a + (new Date()).getTime() + '=1') : "");
            return u;
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

}());

//////////////////////////////////////////////////////////////////////
