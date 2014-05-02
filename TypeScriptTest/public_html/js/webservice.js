(function () {
    "use strict";

    var serviceURL = "http://ec2-75-101-200-254.compute-1.amazonaws.com/mtw";

    chs.WebService = chs.Class({

        static$: {

            get: function (command, params, callback, context) {
                params.action = command;
                chs.ajax.get(chs.ajax.url(serviceURL, params, true), function (url, json) {
                    var d;
                    try {
                        d = JSON.parse(json);
                    }
                    catch (e) {
                        console.log("Bad result from web service: " + json);
                        d = null;
                    }
                    if (d !== null && callback) {
                        callback.call(context, d);
                    }
                }, null, this, false, true);
            },

            post: function (command, params, data, callback, context) {
                var url;
                params.action = command;
                url = chs.ajax.url(serviceURL, params, true);
                chs.ajax.post(url, data, function (url, json) {
                    var d;
                    try {
                        d = JSON.parse(json);
                    }
                    catch (e) {
                        console.log("Bad result from web service: " + json);
                        d = null;
                    }
                    if (d !== null && callback) {
                        callback.call(context, d);
                    }
                }, null, this, false, true);
            }

        }
    });

}());
