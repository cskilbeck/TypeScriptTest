var MainMenu = (function () {
    "use strict";

    var loader,
        globalLoader,
        consolas,
        consolasItalic,

        UserImage = chs.Class({
            inherit$: [chs.Button, chs.Drawable],

            $: function (x, y, width, height, url) {
                chs.Button.call(this);
                chs.Drawable.call(this);
                this.loader = new chs.Loader("");
                this.dimensions = { width: width, height: height };
                this.org = { x: x, y: y };
                this.setPosition(x + 0.5, y + 0.5);
                this.clipRect = new chs.ClipRect(0, 0, this.width, this.height, 14);
                this.addChild(this.clipRect);
                this.loader.loadItem(url).then(this, function (img) {
                    this.image = new chs.Sprite(img);
                    this.clipRect.addChild(this.image);
                });
                this.border = new chs.Panel(0, 0, this.width, this.height, undefined, "black", this.clipRect.radius, 2, 255);
                this.addChild(this.border);
                this.loader.start();
                this.onIdle = function () { this.setPosition(this.org.x, this.org.y); this.border.lineColour = "black"; };
                this.onHover = function () { this.setPosition(this.org.x, this.org.y); this.border.lineColour = "white"; };
                this.onPressed = function () { this.setPosition(this.org.x + 1, this.org.y + 1); this.border.lineColour = "white"; };
            },

            onUpdate: function(time, deltaTime) {
                if(this.image) {
                    this.image.scaleTo(this.width, this.height);
                }
            }
        });

    return chs.Class({
        inherit$: [chs.Drawable],

        $: function () {
            chs.Drawable.call(this);
            chs.User.id = 0;
            this.enabled = false;
            this.visible = false;
            this.dimensions = { width: chs.desktop.width, height: chs.desktop.height };
            loader = new chs.Loader('img/');
            chs.desktop.addChild(loader);
            consolasItalic = chs.Font.load("Consolas_Italic", loader);
            consolas = chs.Font.load("Consolas", loader);
            mtw.BoardTile.load(loader);
            mtw.Dictionary.init(loader.load("dictionary.json"));
            this.game = new Game(this, loader);
            this.game.addEventHandler("closed", this.activate, this);
            loader.addEventHandler("complete", this.loadComplete, this);
            loader.start();
        },

        logout: function () {
            chs.Cookies.remove('provider_id');
            chs.Cookies.remove('session_id');
            chs.Cookies.remove('login_error');
            window.location.reload();
            this.panel.removeChildren();
            this.panel.addChild(new chs.Label("Logging out...", consolasItalic).setPosition(this.panel.width / 2, this.panel.height / 2).setPivot(0.5, 0.5));
        },

        loadComplete: function () {
            var session_id = chs.Cookies.get('session_id'),
                provider_id = chs.Cookies.get('provider_id'),   // this will be null if nothing chosen or 0 if Anon or valid provider ID
                login_error = chs.Cookies.get('login_error'),
                buttons = [
                    "Options",
                    "How to play",
                    "Credits"
                ],
                callbacks = [
                    this.showOptions,
                    this.showHowToPlay,
                    this.showCredits
                ],
                w = this.width,
                h = this.height,
                pw = w / 1.25,
                ph = h / 1.25;

            chs.desktop.removeChild(loader);
            this.game.loadComplete();
            this.panel = new chs.Panel(w / 2, h / 2, pw, ph, "darkslategrey", "white", 25, 4, 255).setPivot(0.5, 0.5);
            this.panel.transparency = 128;
            this.button = new chs.TextButton("PLAY!", consolasItalic, pw / 2, ph / 2, 200, 50, this.playClicked, this).setPivot(0.5, 0.5);
            this.panel.addChild(this.button);
            this.addChild(this.panel);
            if (session_id === null || provider_id === null || parseInt(provider_id, 10) === 0) {
                buttons.push('Login');
                callbacks.push(this.showLogin);
                if (login_error !== null) {
                    this.panel.addChild(new chs.Label("Login error: " + login_error, consolas).setPosition(this.panel.width - 24, 16).setPivot(1, 0));
                    chs.Cookies.remove("login_error");
                }
            }
            if (session_id !== null) {
                chs.WebService.get('session', { session_id: session_id }, function (data) {
                    var logoutButton;
                    if (data.error !== undefined) {
                        if(provider_id !== 0) {
                            window.location.reload();
                        }
                    } else {
                        chs.User.id = data.user_id;
                        chs.User.name = data.name;
                        chs.User.picture = data.picture;
                        chs.User.providerName = data.providerName;
                        if(chs.User.picture) {
                            logoutButton = new UserImage(12, 12, 64, 64, chs.User.picture);
                        } else {
                            logoutButton = new chs.TextButton(chs.User.name, consolasItalic, 12, 12, 20, 35);
                        }
                        this.panel.addChild(logoutButton);
                        logoutButton.addEventHandler("clicked", function () {
                            this.addChild(
                                new chs.MessageBox(
                                    "You are logged in as " + chs.User.name + " with " + chs.User.providerName + ", would you like to log out?",
                                    consolasItalic,
                                    ['Yes, log me out', 'No'],
                                    function (button) {
                                        if(button === 0) {
                                            this.logout();
                                        }
                            }, this, consolas));
                        }, this);
                    }
                }, this);
            }
            this.panel.addChild(new chs.Menu(20, this.panel.height - 20, consolasItalic, buttons, callbacks, this).setPivot(0, 1));
            this.enabled = true;
            this.visible = true;
        },

        showLogin: function () {
            var loginScreen = new LoginScreen(loader, this);
            loginScreen.addEventHandler("closed", this.activate, this);
            this.activate(false);
            this.addSibling(loginScreen);
        },

        onUpdate: function (time, deltaTime) {
            this.button.rotation = Math.pow(Math.sin(time / 1000), 16) * Math.sin(time / 25) * 0.05;
        },

        playClicked: function () {
            this.activate(false);
            this.addSibling(this.game);
            this.game.init(1);
        },

        activate: function (activate) {
            this.enabled = activate === undefined ? true : activate;
            this.visible = activate === undefined ? true : activate;
        }
    });

}());