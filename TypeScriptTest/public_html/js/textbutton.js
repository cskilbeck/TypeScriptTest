//////////////////////////////////////////////////////////////////////
(function () {
    "use strict";

    chs.TextButton = chs.Class({
        inherit$: [chs.Button, chs.Drawable],

        $: function (text, font, x, y, w, h, click, context, radius) {
            chs.Button.call(this, click, context);
            chs.Drawable.call(this);
            this.panel = new chs.Panel(this, x, y, w, h, "darkSlateGrey", "white", radius === undefined ? h / 3 : radius, 3);
            this.addChild(this.panel);
            this.label = new chs.Label(text, font);
            this.label.setPivot(0.5, font.midPivot);
            this.idleFillColour = 'darkSlateGrey';
            this.idleLineColour = 'white';
            this.hoverFillColour = 'slateGrey';
            this.hoverLineColour = 'white';
            this.pressedFillColour = 'lightSlateGrey';
            this.pressedLineColour = 'darkSlateGrey';
            this.addChild(this.label);
            this.panel.width = Math.max(this.width, this.label.width + 16);
            this.label.setPosition(this.width / 2, this.height / 2);
            this.addChild(this.label);
        },

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
