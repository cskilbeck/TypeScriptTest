(function () {
    "use strict";

    function handleResult(url, xr, callback, context) {
        var d = null;
        if(xr.status == 200) {
            try {
                d = JSON.parse(xr.responseText);
            }
            catch (e) {
                console.log("Bad result from web service: " + xr.responseText);
            }
        }
        if(callback) {
            callback.call(context, d);
        }
    }

    glib.WebService = glib.Class({

        static$: {

            get: function (command, params, callback, context) {
                var url;
                params.action = command;
                url = glib.ajax.url(mtw.WebServiceURL, params, false);
                glib.ajax.get(url, function (url, xr) {
                    handleResult(url, xr, callback, context);
                }, null, this, false, true);
            },

            post: function (command, params, data, callback, context) {
                var url;
                params.action = command;
                url = glib.ajax.url(mtw.WebServiceURL, params, false);
                glib.ajax.post(url, data, function (url, xr) {
                    handleResult(url, xr, callback, context);
                }, null, this, false, true);
            }

        }
    });

}());
