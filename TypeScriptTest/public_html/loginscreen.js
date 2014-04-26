var LoginScreen = (function () {
    "use strict";

    function goto(x) {
        window.location = window.location.origin + "/" + x;
    }

    var pfont,
        ploader;

    var ProviderButton = chs.Class({
        inherit$: [chs.PanelButton],

        static$: {
            init: function (font, loader) {
                pfont = font;
                ploader = new chs.Loader();
            }
        },

        $: function (x, y, provider) {    // oauth_id, oauth_name, oauth_icon
            var fh = pfont.height,
                logo = new chs.Image();
            chs.PanelButton.call(this, x, y, 320, fh + 24, "rgb(255, 255, 255)", "white", 4, 2);
            this.transparency = 128;
            this.addChild(new chs.Label(provider.oauth_name, pfont).setPosition(8, this.height / 2).setPivot(0, pfont.midPivot));
            logo.addEventHandler("loaded", function () {
                this.setScale(32 / this.height);
            });
            logo.setPosition(this.width - 8, this.height / 2);
            logo.setPivot(1, 0.5);
            logo.src = provider.oauth_icon;
            this.addChild(logo);
            this.onIdle = function () { this.transparency = 128; };
            this.onHover = function () { this.transparency = 192; };
            this.onPressed = function () { this.transparency = 224; };
        }
    });


    return chs.Class({
        inherit$: [chs.Drawable],

        $: function (loader, mainMenu) {
            var consolasItalic = chs.Font.load("Consolas_Italic", loader);
            chs.Drawable.call(this);
            this.mainMenu = mainMenu;
            this.dimensions = chs.desktop.dimensions;
            ProviderButton.init(consolasItalic, loader);
            chs.WebService.get('oauthlist', {}, function (result) {
                var p,
                    b,
                    y = 20;
                for (p in result.providers) {
                    b = new ProviderButton(20, y, result.providers[p]);
                    this.addChild(b);
                    y += b.height + 10;
                }
            }, this);
            this.addChild(new chs.Menu(this.width / 2, this.height / 2, consolasItalic, [
                '<Login with Google',
                '<Login with Facebook',
                '<Login with Microsoft',
                '<Login with Twitter'
            ], [
                function () { goto('logingoogle.php'); },
                function () { goto('loginfacebook.php'); },
                function () { goto('loginmicrosoft.php'); },
                function () { goto('logintwitter.php'); }
            ], this).setPivot(0, 0));

            if (mtw.User.error) {
                this.addChild(new chs.Label(mtw.User.error + ":" + mtw.User.message.toString(), consolasItalic).setPosition(12, 12));
            }
            this.addChild(new chs.TextButton("Cancel", consolasItalic, 16, this.height - 16, 120, 36, this.close, this, 4).setPivot(0, 1));
        }
    });

}());