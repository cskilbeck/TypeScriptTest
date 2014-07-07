//////////////////////////////////////////////////////////////////////
(function () {
    "use strict";

    glib.TextButton = glib.Class({ inherit$: [glib.Button, glib.Drawable],

        $: function (text, font, x, y, w, h, click, context, radius, outline) {
            var ol = outline === undefined ? true : false;
            glib.Button.call(this, click, context);
            glib.Drawable.call(this);

            this.idleFillColour = 'darkSlateGrey';
            this.hoverFillColour = 'slateGrey';
            this.pressedFillColour = 'lightSlateGrey';

            if (!ol) {
                this.idleLineColour = undefined;
                this.hoverLineColour = undefined;
                this.pressedLineColour = undefined;
            } else {
                this.idleLineColour = 'white';
                this.hoverLineColour = 'white';
                this.pressedLineColour = 'darkSlateGrey';
            }

            this.label = new glib.Label(text, font);
            this.size = { width: Math.max(w, this.label.width + 16), height: h };
            this.setPosition(x, y);
            this.panel = new glib.Panel(0, 0, this.width, h, "darkSlateGrey", this.idleLineColour, radius === undefined ? h / 3 : radius, 3);
            this.addChild(this.panel);
            this.label.setPivot(0.5, font.midPivot);
            this.label.setPosition(this.width / 2, this.height / 2);
            this.addChild(this.label);

        },

        text: glib.Property({
            set: function (t) {
                this.label.text = t;
            },
            get: function () {
                return this.label.text;
            }
        }),

        onHover: function () {
            this.panel.lineColour = this.hoverLineColour;
            this.panel.fillColour = this.hoverFillColour;
        },

        onIdle: function () {
            this.panel.lineColour = this.idleLineColour;
            this.panel.fillColour = this.idleFillColour;
        },

        onPressed: function () {
            this.panel.lineColour = this.pressedLineColour;
            this.panel.fillColour = this.pressedFillColour;
        }
    });

}());
