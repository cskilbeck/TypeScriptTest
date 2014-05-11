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
                        params = {},
                        url = null;

                    window.onresize = function () {
                        pw = screen.clientWidth;
                        ph = screen.clientHeight;
                        canvas.style.top = (ph - canvas.height) / 2 + "px";
                        canvas.style.left = (pw - canvas.width) / 2 + "px";
                    };

                    if(chs.OAuth.login()) {

                        // resize canvas to fill the viewport here...
                        // then deal with whatever that ends up being

                        screen = document.getElementById("screen");
                        canvas = document.getElementById("myCanvas");
                        window.onresize();
                        context = canvas.getContext('2d');
                        loader = new chs.Loader('img/');
                        chs.Debug.init(context, chs.Font.load("Fixedsys", loader));
                        loader.addEventHandler("complete", Startup.start);
                        loader.start();
                    }
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
                    requestAnimationFrame(Startup.run);
                }
            };

        return Startup;

    }()).init();
};
