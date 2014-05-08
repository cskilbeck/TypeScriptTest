(function () {
    "use strict";

    chs.OAuth = chs.Class({

        static$: {
            login: function () {
                var params,
                    url = null;
                if (chs.Cookies.get('session_id') === null || chs.Cookies.get('anon_user_id') !== null) {
                    switch (chs.Cookies.get('provider_id')) {
                    // 1: Google
                    case '1':
                        params = {
                            response_type: 'code',
                            client_id: '1070809812407-drgaq8tgn9q9ill90jv5aumlap8d886s.apps.googleusercontent.com',
                            redirect_uri: 'http://make-the-words.com/oauth2callback',
                            scope: 'https://www.googleapis.com/auth/userinfo.profile',
                            access_type: 'offline'
                        };
                        url = 'https://accounts.google.com/o/oauth2/auth';
                        break;
                    // 4: Live ID
                    case '4':
                        params = {
                            response_type: 'code',
                            client_id : '0000000044101D70',
                            redirect_uri: 'http://make-the-words.com/oauth2callback',
                            scope: 'wl.basic wl.offline_access wl.signin'
                        };
                        url = 'https://https://login.live.com/oauth20_authorize.srf';
                        break;
                    default:
                        // log them in as an anonymous user
                        // allow the anonymous user_id to be converted to a real one later (anon_user_id cookie)
                        chs.WebService.post("anon", {}, {}, function(data) {
                            if (data && !data.error) {
                                chs.Cookies.set('session_id', data.session_id);
                                chs.Cookies.set('anon_user_id', data.user_id);
                            } else {
                                // some error creating an anonymous session...
                            }
                        });
                        break;
                    }
                    if(url !== null) {
                        window.location.replace(url + "?" + chs.Util.objectToQueryString(params));
                        return false;   // don't load, we're redirecting...
                    }
                }
                return true;    // continue to load
            }
        }

    });



} ());