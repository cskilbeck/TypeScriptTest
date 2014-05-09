(function () {
    "use strict";

    chs.OAuth = chs.Class({

        static$: {
            login: function () {
                var params,
                    session_id,
                    provider_id,
                    anon,
                    login_error,
                    url = null;
                console.log("LOGIN:");
                session_id = chs.Cookies.get('session_id');
                provider_id = chs.Cookies.get('provider_id') || 0;
                login_error = chs.Cookies.get('login_error');
                if(session_id === null) {
                    console.log("Anon");
                    chs.WebService.post("anon", {}, {}, function(data) {
                        if (data && !data.error) {
                            chs.Cookies.set('session_id', data.session_id);
                            chs.Cookies.set('anon_user_id', data.user_id);
                        } else {
                            alert("Error getting anon user id");
                        }
                    });
                }
                console.log("Done");
                return true;    // continue to load
            }
        }
    });

} ());