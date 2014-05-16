(function () {
    "use strict";

    var font,
        undoImage,
        redoImage;

    mtw.UI = chs.Class({
        inherit$: [chs.Drawable],

        $: function (loader) {
            chs.Drawable.call(this);
            font = chs.Font.load("Calibri", loader);
            undoImage = loader.load("undo.png");
            redoImage = loader.load("redo.png");
        },

        loadComplete: function() {
            this.size = { width: 180, height: chs.desktop.height };
            this.setPosition(chs.desktop.width, 0);
            this.setPivot(1, 0);
            this.button = new chs.TextButton("", font, 0, 0, this.width, font.height + 12, function () {
                var s = this.screens[this.currentScreen];
                if (s) {
                    s.visible = false;
                    s.enabled = false;
                }
                this.currentScreen = (this.currentScreen + 1) % this.screens.length;
                s = this.screens[this.currentScreen];
                if (s) {
                    s.visible = true;
                    s.enabled = true;
                }
                if (s.title !== undefined) {
                    this.button.text = s.title;
                }
            }, this, 0, false);
            this.addChild(this.button);
            this.addChild(new chs.SpriteButton(undoImage, "scale", this.width / 2 - this.width / 4, this.height - undoImage.height / 2, this.undo, this));
            this.addChild(new chs.SpriteButton(redoImage, "scale", this.width / 2 + this.width / 4, this.height - redoImage.height / 2, this.redo, this));
            this.client = new chs.ClipRect(0, this.button.height + 4, this.width, this.height - this.button.height - undoImage.height - 4, 0);
            this.addChild(this.client);
            this.screens = [];
            this.currentScreen = 0;
        },

        addScreen: function (screen) {
            if(this.screens.length > 0) {
                screen.visible = false;
                screen.enabled = false;
            } else if (screen.title) {
                this.button.text = screen.title;
            }
            this.client.addChild(screen);
            this.screens.push(screen);
        },

        undo: function () {
            this.dispatchEvent("undo");
        },

        redo: function () {
            this.dispatchEvent("redo");
        }

    });


} ());