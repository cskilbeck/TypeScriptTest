//////////////////////////////////////////////////////////////////////
(function () {
    "use strict";

    chs.TextButton = chs.Class({
        inherit$: [chs.PanelButton],

        $: function (text, font, x, y, w, h, click, context, radius) {
            chs.PanelButton.call(this, x, y, w, h, "darkSlateGrey", "white", radius === undefined ? h / 3 : radius, 3, click, context, 4);
            this.label = new chs.Label(text, font);
            this.label.setPivot(0.5, font.midPivot);
            this.idleFillColour = 'darkSlateGrey';
            this.idleLineColour = 'white';
            this.hoverFillColour = 'slateGrey';
            this.hoverLineColour = 'white';
            this.pressedFillColour = 'lightSlateGrey';
            this.pressedLineColour = 'darkSlateGrey';
            this.addChild(this.label);
            this.width = Math.max(this.width, this.label.width + 16);
            this.label.setPosition(this.width / 2, this.height / 2);
        },

        onHover: function () {
            this.lineColour = this.hoverLineColour;
            this.fillColour = this.hoverFillColour;
        },

        onIdle: function () {
            this.lineColour = this.idleLineColour;
            this.fillColour = this.idleFillColour;
        },

        onPressed: function () {
            this.lineColour = this.pressedLineColour;
            this.fillColour = this.pressedFillColour;
        }
    });

}());
