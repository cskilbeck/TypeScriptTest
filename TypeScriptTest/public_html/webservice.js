﻿(function() {
    "use strict";

    var serviceURL = "http://ec2-75-101-200-254.compute-1.amazonaws.com/mtw";

    chs.WebService = chs.Class({

        static$: {

            get: function (command, params, callback, context) {
                params['action'] = command;
                chs.ajax.get(chs.ajax.url(serviceURL, params, false), function (url, json) {
                    var d
                    try {
                        d = JSON.parse(json);
                    }
                    catch (e) {
                        console.log("Bad result from web service: " + json);
                        d = null
                    }
                    if (d !== null) {
                        callback.call(context, d);
                    }
                }, null, this, false);
            }
        }
    });

}());
