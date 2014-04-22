var MainMenu = (function () {
    "use strict";

    var loader,
        consolas,
        consolasItalic;

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
            Tile.load(loader);
            Dictionary.init(loader.load("dictionary.json"));
            this.game = new Game(this, loader);
            this.game.addEventHandler("closed", this.activate, this);
            loader.start(this.loadComplete, this);
        },

        loadComplete: function () {
            var buttons = [
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
            if (mtw.User.id === undefined || mtw.User.name === undefined) {
                buttons.push('Login');
                callbacks.push(this.showLogin);
            } else {
                this.panel.addChild(new chs.Label("Logged in as " + mtw.User.name, consolas).setPivot(1, 1).setPosition(this.panel.width - 20, this.panel.height - 20));
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