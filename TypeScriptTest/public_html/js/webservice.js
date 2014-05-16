(function () {
    "use strict";

    // need a way to automatically use the right one...

    var serviceURL = mtw.WebServiceURL; //"http://ec2-75-101-200-254.compute-1.amazonaws.com/mtw";
    //var serviceURL = "http://10.164.90.82/mtw";

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
        }
    }

    chs.WebService = chs.Class({

        static$: {

            get: function (command, params, callback, context) {
                var url;
                params.action = command;
                url = chs.ajax.url(serviceURL, params, true);
                chs.ajax.get(url, function (url, xr) {
                    handleResult(url, xr, callback, context);
                }, null, this, false, true);
            },

            post: function (command, params, data, callback, context) {
                var url;
                params.action = command;
                url = chs.ajax.url(serviceURL, params, true);
                chs.ajax.post(url, data, function (url, xr) {
                    handleResult(url, xr, callback, context);
                }, null, this, false, true);
            }

        }
    });

}());
