var MainMenu = (function () {
    "use strict";

    var loader,
        consolasItalic,

        MainMenu = function () {
            chs.Drawable.call(this);
            this.enabled = false;
            this.visible = false;
            this.dimensions = { width: 800, height: 600 };
            loader = new chs.Loader('img/');
            consolasItalic = chs.Font.load("Consolas_Italic", loader);
            Tile.load(loader);
            Dictionary.init(loader.load("dictionary.json"));

            this.game = new Game(this);
            this.game.load(loader);

            chs.desktop.addChild(loader);
            loader.start(this.loadComplete, this);
        };

    return chs.extend(MainMenu, chs.Drawable, {

        loadComplete: function () {
            var button,
                panel;
            this.game.loadComplete();
            chs.desktop.removeChild(loader);

            panel = new chs.Panel(400, 300, 640, 480, "black", "white", 20, 4, 255).setPivot(0.5, 0.5);
            button = new chs.FancyTextButton("PLAY!", consolasItalic, 320, 240, 200, 50, this.playClicked, this).setPivot(0.5, 0.5);
            panel.addChild(button);
            this.addChild(panel);

            this.enabled = true;
            this.visible = true;
        },

        onUpdate: function (deltaTime) {
            this.Super.onUpdate(deltaTime);
        },

        playClicked: function () {
            this.enabled = false;
            this.visible = false;
            this.addSibling(this.game);
            this.game.init();
        },

        gameClosed: function () {
            this.game.close();
            this.enabled = true;
            this.visible = true;
        }

    });

}());