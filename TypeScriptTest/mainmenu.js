var MainMenu = (function () {
    "use strict";

    var loader,
        consolasItalic;

    return chs.extender(chs.Drawable, {}, {

        $: function () {
            chs.Drawable.call(this);
            this.enabled = false;
            this.visible = false;
            this.dimensions = { width: 800, height: 600 };
            loader = new chs.Loader('img/');
            chs.desktop.addChild(loader);
            consolasItalic = chs.Font.load("Consolas_Italic", loader);
            Tile.load(loader);
            Dictionary.init(loader.load("dictionary.json"));
            this.game = new Game(this, loader);
            loader.start(this.loadComplete, this);
        },

        loadComplete: function () {
            this.game.loadComplete();
            chs.desktop.removeChild(loader);

            this.panel = new chs.Panel(400, 300, 640, 480, "darkslategrey", "white", 25, 4, 255).setPivot(0.5, 0.5);
            this.panel.transparency = 128;
            this.button = new chs.FancyTextButton("PLAY!", consolasItalic, 320, 240, 200, 50, this.playClicked, this).setPivot(0.5, 0.5);
            this.panel.addChild(this.button);
            this.addChild(this.panel);

            this.panel.addChild(new chs.Menu(20, 480 - 20, consolasItalic, [
                { text: "Options", clicked: null, context: null },
                { text: "How to play", clicked: null, context: null },
                { text: "Login", clicked: null, context: null },
                { text: "Credits", clicked: null, context: null }
            ]).setPivot(0, 1));

            this.enabled = true;
            this.visible = true;
        },

        onUpdate: function (time, deltaTime) {
            this.button.rotation = Math.pow(Math.sin(time / 1000), 16) * Math.sin(time / 25) * 0.05;
        },

        playClicked: function () {
            this.enabled = false;
            this.visible = false;
            this.addSibling(this.game);
            this.game.init(1);
        },

        gameClosed: function () {
            this.game.close();
            this.enabled = true;
            this.visible = true;
        }

    });

}());