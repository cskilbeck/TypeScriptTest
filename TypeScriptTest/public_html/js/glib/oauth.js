(function () {
    "use strict";

    glib.OAuth = glib.Class({

        static$: {
            login: function (callback, context) {
                var session_id,
                    provider_id,
                    anon,
                    login_error;
                session_id = glib.Cookies.get('session_id');
                provider_id = glib.Cookies.get('provider_id') || 0;
                login_error = glib.Cookies.get('login_error');
                if(session_id === null) {
                    glib.WebService.post("anon", {}, {}, function(data) {
                        if (data && !data.error) {
                            glib.Cookies.set('session_id', data.session_id);
                            glib.Cookies.set('anon_user_id', data.user_id);
                            glib.User.id = data.user_id;
                            callback.call(context);
                        } else {
                            console.log("Error getting anon user id");
                        }
                    });
                } else {
                    callback.call(context);
                }
            }
        }
    });

} ());