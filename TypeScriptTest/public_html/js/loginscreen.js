(function () {
    "use strict";

    var pfont,
        ploader,

        ProviderButton = chs.Class({ inherit$: [chs.PanelButton],

            static$: {
                init: function (font, loader) {
                    pfont = font;
                    ploader = new chs.Loader();
                }
            },

            $: function (x, y, provider) {    // oauth_id, oauth_name, oauth_icon
                var fh = pfont.height,
                    params,
                    logo = new chs.Image();
                chs.PanelButton.call(this, x, y, 320, fh + 24, "rgb(96, 128, 128)", "white", 4, 2, function () {
                    chs.Cookies.set('provider_id', provider.oauth_provider, 30);
                    params = {
                        'client_id': provider.client_id,
                        'scope': provider.scope,
                        'redirect_uri': "http://make-the-words.com/oauth2callback",
                        'response_type': "code"
                    };
                    window.location.replace(provider.url + "?" + chs.Util.objectToQueryString(params));
                });
                this.addChild(new chs.Label(provider.oauth_name, pfont).setPosition(8, this.height / 2).setPivot(0, pfont.midPivot));
                logo.addEventHandler("loaded", function () {
                    this.setScale(32 / this.height);
                });
                logo.setPosition(this.width - 8, this.height / 2);
                logo.setPivot(1, 0.5);
                logo.src = provider.oauth_icon;
                this.addChild(logo);
                this.onIdle = function () { this.fillColour = "rgb(96, 128, 128)"; };
                this.onHover = function () { this.fillColour = "rgb(128, 192, 192)"; };
                this.onPressed = function () { this.fillColour = "rgb(64, 64, 64)"; };
            }
        });

    mtw.LoginScreen = chs.Class({ inherit$: [chs.Drawable],

        $: function (loader, mainMenu) {
            var consolasItalic = chs.Font.load("Consolas_Italic", loader),
                err = chs.Cookies.get('login_error'),
                y;
            chs.Drawable.call(this);
            this.size = chs.desktop.size;
            this.mainMenu = mainMenu;
            this.menu = new chs.Drawable();
            this.addChild(this.menu);
            this.banner = new chs.Label("Log in with one of these accounts:", consolasItalic).setPosition(chs.desktop.width / 2, 100).setPivot(0.5, 0);
            this.addChild(this.banner);
            this.menu.size = { width: 320, height: 0 };
            ProviderButton.init(consolasItalic, loader);
            chs.WebService.get('oauthlist', {}, function (result) {
                var p,
                    b;
                y = 0;
                for (p in result.providers) {
                    b = new ProviderButton(0, y, result.providers[p]);
                    this.menu.addChild(b);
                    y += b.height + 10;
                    b.addEventHandler("clicked", this.hideMenu, this);
                }
                this.menu.size = { width: b.width, height: y };
                this.menu.setDirty();
            }, this);
            this.menu.setPivot(0.5, 0.5);
            this.menu.setPosition(chs.desktop.width / 2, chs.desktop.height / 2);
            if (err !== null) {
                this.addChild(new chs.Label("Login error:" + err, consolasItalic).setPosition(12, 12));
            }
            this.addChild(new chs.TextButton("Cancel", consolasItalic, 16, this.height - 16, 120, 36, this.close, this, 4).setPivot(0, 1));
        },

        hideMenu: function () {
            this.menu.visible = false;
            this.banner.text = "Logging in...";
        }
    });

}());