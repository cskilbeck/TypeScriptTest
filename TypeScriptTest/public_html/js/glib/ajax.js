/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    function send(url, callback, progressCallback, context, method, data, binary, crossDomain) {

        var cd = crossDomain === undefined ? false : crossDomain,
            xr;

        if (glib.Browser.type === 'MSIE' && glib.Browser.version <= 10 && crossDomain) {
            xr = new XDomainRequest();
            xr.open(method, url);
            xr.onerror = function () {
                console.log("XDomainRequest error loading " + url);
            };
            xr.onprogress = function () {};
            xr.timeout = 5000;
            xr.ontimeout = function () {
                xr.status = 408;
                xr.responseText = "";
                console.log("XDomainRequest timeout loading " + url);
                callback.call(context, url, xr);
            };
            xr.onload = function () {
                if(xr.responseText) {
                    xr.status = 200;    // feck
                }
                callback.call(context, url, xr);
            };
        } else {
            xr = new XMLHttpRequest();
            xr.open(method, url);
            if (binary) {
                xr.responseType = 'arraybuffer';
            }
            xr.onreadystatechange = function () {
                if (xr.readyState === XMLHttpRequest.DONE) {
                    callback.call(context, url, xr);
                }
            };
            xr.ontimeout = function () {
                console.log("Ajax timeout loading " + url);
                callback.call(context, url, xr);
            };
            xr.onerror = function() {
                console.log("Ajax Error loading " + url);
            };
            xr.onprogress = function (e) {
                if (progressCallback) {
                    progressCallback.call(context, url, e);
                }
            };
            if (method === 'POST') {
                xr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            }
        }
        xr.send(data);
        return xr;
    }

    //////////////////////////////////////////////////////////////////////

    glib.ajax = glib.Class({

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