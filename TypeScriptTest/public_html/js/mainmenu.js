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
                    this.image.scaleTo(this.width, this.height);
                    this.clipRect.addChild(this.image);
                });
                this.border = new chs.Panel(0, 0, this.width, this.height, undefined, "black", this.clipRect.radius, 2, 255);
                this.addChild(this.border);
                this.loader.start();
                this.onIdle = function () { this.setPosition(this.org.x, this.org.y); this.border.lineColour = "black"; };
                this.onHover = function () { this.setPosition(this.org.x, this.org.y); this.border.lineColour = "white"; };
                this.onPressed = function () { this.setPosition(this.org.x + 1, this.org.y + 1); this.border.lineColour = "white"; };
            }
        });

    return chs.Class({
        inherit$: [chs.Drawable],

        $: function () {
            chs.Drawable.call(this);
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
            this.addChild(new chs.MessageBox("Are you sure you want to log out?\n", consolasItalic, ['Yes, log me out', 'No'], function (id) {
                if (id === 0) {
                    chs.Cookies.remove('user_name');
                    chs.Cookies.remove('user_id');
                    chs.Cookies.remove('user_picture');
                    chs.Cookies.remove('session_id');
                    chs.Cookies.remove('login_error');
                    window.location.reload();
                    this.panel.removeChildren();
                    this.panel.addChild(new chs.Label("Logging out...", consolasItalic).setPosition(this.panel.width / 2, this.panel.height / 2).setPivot(0.5, 0.5));
                }
            }, this, consolas));
            // remove all session and user cookies here
            // then reload page
        },

        loadComplete: function () {
            var user_name = chs.Cookies.get('user_name'),
                user_id = chs.Cookies.get('user_id'),
                user_picture = chs.Cookies.get('user_picture'),
                session_id = chs.Cookies.get('session_id'),
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


            chs.User.name = user_name;
            chs.User.id = user_id;

            chs.desktop.removeChild(loader);
            this.game.loadComplete();
            this.panel = new chs.Panel(w / 2, h / 2, pw, ph, "darkslategrey", "white", 25, 4, 255).setPivot(0.5, 0.5);
            this.panel.transparency = 128;
            this.button = new chs.TextButton("PLAY!", consolasItalic, pw / 2, ph / 2, 200, 50, this.playClicked, this).setPivot(0.5, 0.5);
            this.panel.addChild(this.button);
            this.addChild(this.panel);

            if (session_id === null) {
                buttons.push('Login');
                callbacks.push(this.showLogin);

                if (login_error !== null) {
                    this.panel.addChild(new chs.Label("Login error: " + login_error, consolas).setPosition(this.panel.width - 24, 16).setPivot(1, 0));
                    chs.Cookies.remove("login_error");
                }
            } else {
                if (user_picture !== null) {
                    this.panel.addChild(new UserImage(12, 12, 64, 64, user_picture));
                    console.log(user_picture);
                } else if (user_name !== null) {
                    this.panel.addChild(new chs.TextButton(user_name, consolasItalic, 12, 12, 128, 35));
                }
                buttons.push('Logout');
                callbacks.push(this.logout);
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