//////////////////////////////////////////////////////////////////////

window.onload = function () {
    "use strict";

    (function () {
        var screen,
            canvas,
            context,
            loader,
            Startup = {

                init: function () {
                    var pw,
                        ph,
                        oauth2_client_id,
                        oauth2_redirect,
                        oauth2_server_url,
                        oauth2_scope,
                        oauth2_response_type,
                        provider_id,
                        params = {};

                    window.onresize = function () {
                        pw = screen.clientWidth;
                        ph = screen.clientHeight;
                        canvas.style.top = (ph - canvas.height) / 2 + "px";
                        canvas.style.left = (pw - canvas.width) / 2 + "px";
                    };

                    if (chs.Cookies.get('session_id') === null || chs.Cookies.get('anon_user_id') !== null) {
                        switch (chs.Cookies.get('provider_id')) {
                        case '1':
                            params = {
                                response_type: 'code',
                                client_id: '1070809812407-drgaq8tgn9q9ill90jv5aumlap8d886s.apps.googleusercontent.com',
                                redirect_uri: 'http://make-the-words.com/oauth2callback',
                                scope: 'https://www.googleapis.com/auth/userinfo.profile',
                                access_type: 'offline'
                            };
                            window.location.replace('https://accounts.google.com/o/oauth2/auth' + "?" + chs.Util.objectToQueryString(params));
                            return;
                        default:
                            // log them in as an anonymous user
                            // allow the anonymous user_id to be converted to a real one later (anon_user_id cookie)
                            chs.WebService.post("anon", {}, {}, function(data) {
                                if (data && !data.error) {
                                    chs.Cookies.set('session_id', data.session_id);
                                    chs.Cookies.set('anon_user_id', data.user_id);
                                    console.log("Set anon_user_id to " + data.user_id.toString());
                                }
                            }, this);
                            break;
                        }
                    }
                    screen = document.getElementById("screen");
                    canvas = document.getElementById("myCanvas");
                    window.onresize();
                    context = canvas.getContext('2d');
                    loader = new chs.Loader('img/');
                    chs.Debug.init(context, chs.Font.load("Fixedsys", loader));
                    loader.addEventHandler("complete", Startup.start);
                    loader.start();
                },

                start: function () {
                    chs.Mouse.init(canvas, screen);
                    chs.Keyboard.init();
                    chs.Timer.init();
                    chs.desktop = new chs.Panel(0, 0, canvas.width, canvas.height, "rgb(32, 128, 48)");
                    if (typeof window.main === "function") {
                        window.main(chs.desktop);
                    }
                    Startup.run();
                },

                run: function () {
                    chs.Timer.update();
                    chs.Keyboard.update();
                    chs.Mouse.update(chs.desktop);
                    chs.desktop.update(chs.Timer.time, chs.Timer.delta);
                    chs.desktop.draw(context, chs.Matrix.identity(), 255);
                    chs.Debug.draw();
                    requestAnimFrame(Startup.run);
                }
            };

        return Startup;

    }()).init();
};
