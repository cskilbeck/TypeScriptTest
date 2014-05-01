﻿//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    function send(url, callback, progressCallback, context, method, data, binary, crossDomain) {

        var cd = crossDomain === undefined ? false : crossDomain,
            ie9,
            xr;

        if (chs.Browser.type === 'MSIE' && chs.Browser.version <= 10 && crossDomain) {
            xr = new XDomainRequest();
            ie9 = true;
        } else {
            xr = new XMLHttpRequest();
            ie9 = false;
        }

        xr.open(method, url);

        if (!ie9) {
            if (binary) {
                xr.responseType = 'arraybuffer';
            } else {
                xr.responseType = 'application/json';
            }
            xr.onreadystatechange = function () {
                if (xr.readyState === XMLHttpRequest.DONE) {
                    if (binary) {
                        callback.call(context, url, chs.Util.getResponseAsArray(xr));
                    } else {
                        callback.call(context, url, xr.responseText);
                    }
                }
            };
            xr.onprogress = function (e) {
                if (progressCallback) {
                    progressCallback.call(context, url, e);
                }
            };
        } else {
            xr.onload = function () {
                callback.call(context, url, xr.responseText);
            };
        }
        if (method === 'POST') {
            xr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        }
        xr.send(data);
        return xr;
    }

    //////////////////////////////////////////////////////////////////////

    chs.ajax = chs.Class({

        static$: {

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

            get: function (url, callback, progressCallback, context, binary, crossDomain) {

                send(url, callback, progressCallback, context, 'GET', null, binary, crossDomain);
            },

            //////////////////////////////////////////////////////////////////////

            post: function (url, data, callback, progressCallback, context, binary, crossDomain) {

                var query = [],
                    key;
                for (key in data) {
                    query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
                }
                send(url, callback, progressCallback, context, 'POST', query.join('&'), binary, crossDomain);
            }
        }
    });

}());

//////////////////////////////////////////////////////////////////////