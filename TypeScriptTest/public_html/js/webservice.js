(function () {
    "use strict";

    function handleResult(url, xr, callback, context) {
        var d;
        if(xr.status == 200) {
            try {
                d = JSON.parse(xr.responseText);
            }
            catch (e) {
                console.log("Bad result from web service: " + xr.responseText);
                d = null;
            }
            if (d !== null && callback) {
                callback.call(context, d);
            }
        } else {
            callback.call(context, null);
        }
    }

    mtw.WebService = mtw.Class({

        static$: {

            get: function (command, params, callback, context) {
                var url;
                params.action = command;
                url = glib.ajax.url(mtw.WebServiceURL, params, true);
                glib.ajax.get(url, function (url, xr) {
                    handleResult(url, xr, callback, context);
                }, null, this, false, true);
            },

            post: function (command, params, data, callback, context) {
                var url;
                params.action = command;
                url = glib.ajax.url(mtw.WebServiceURL, params, true);
                glib.ajax.post(url, data, function (url, xr) {
                    handleResult(url, xr, callback, context);
                }, null, this, false, true);
            }

        }
    });

}());
