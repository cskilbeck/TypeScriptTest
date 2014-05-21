//////////////////////////////////////////////////////////////////////

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
            }
            xr.onreadystatechange = function () {
                var contentType;
                if (xr.readyState === XMLHttpRequest.DONE) {
                    contentType = xr.getResponseHeader("Content-Type");
                    // console.log("[" + xr.status + "] " + contentType + " from " + url);
                    callback.call(context, url, xr);
                }
            };
            xr.onprogress = function (e) {
                if (progressCallback) {
                    progressCallback.call(context, url, e);
                }
            };
            if (method === 'POST') {
                xr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            }
        } else {
            xr.onerror = function () {};
            xr.ontimeout = function () {};
            xr.onprogress = function () {};
            xr.timeout = 5000;
            xr.onload = function () {
                if(xr.responseText) {
                    xr.status = 200;    // feck
                }
                callback.call(context, url, xr);
            };
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
