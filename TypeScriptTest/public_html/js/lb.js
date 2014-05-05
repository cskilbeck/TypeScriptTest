(function () {
    "use strict";

    mtw.LeaderBoard = chs.Class({
        inherit$: [chs.Drawable],

        $: function (font) {
            this.dimensions = { width: 200, height: chs.desktop.height };
            this.topLabel = new chs.Label("NN of NN", font).setPosition(4, 1);
            this.addChild(this.topLabel);

            this.names = new chs.ClipRect(0, this.topLabel.height + 2, 170, chs.desktop.height - this.topLabel.height - 2);
            this.addChild(this.names);

            this.scores = new chs.ClipRect(172, this.names.y, 28, this.names.height);
            this.addChild(this.scores);



        },

        onUpdate: function (time, deltaTime) {
            // call webservice, get LB, update names and scores
        }

    });

} ());
