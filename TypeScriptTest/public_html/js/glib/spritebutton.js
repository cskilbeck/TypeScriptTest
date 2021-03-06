//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    glib.SpriteButton = glib.Class({ inherit$: [glib.Button, glib.Sprite],

        $: function (image, type, x, y, click, context) {
            glib.Button.call(this, click, context);
            glib.Sprite.call(this, image);
            this.setPivot(0.5, 0.5);
            this.type = type;
            this.setPosition(x, y);
            this.origin = { x: x, y: y };
        },

        onIdle: function () {
            switch (this.type) {
            case 'frame':
                this.setFrame(0);
                break;
            case 'offset':
                this.setPosition(this.origin.x, this.origin.y);
                break;
            case 'scale':
                this.setScale(1);
                break;
            }
        },

        onHover: function () {
            switch (this.type) {
            case 'frame':
                this.setFrame(1);
                break;
            case 'offset':
                this.setPosition(this.origin.x - 1, this.origin.y - 1);
                break;
            case 'scale':
                this.setScale(1.25);
                break;
            }
        },

        onPressed: function () {
            switch (this.type) {
            case 'frame':
                this.setFrame(2);
                break;
            case 'offset':
                this.setPosition(this.origin.x + 2, this.origin.y + 2);
                break;
            case 'scale':
                this.setScale(1.5);
                break;
            }
        }
    });

}());
