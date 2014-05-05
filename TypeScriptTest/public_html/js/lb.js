(function () {
    "use strict";

    mtw.LeaderBoard = chs.Class({
        inherit$: [chs.Drawable],

        $: function (font, game) {
            chs.Drawable.call(this);

            this.game = game;
            this.font = font;

            this.dimensions = { width: 192, height: chs.desktop.height };
            this.topLabel = new chs.Label("NN of NN", font).setPosition(4, 1);
            this.addChild(this.topLabel);

            this.highlight = new chs.Panel(0, 0, this.width, this.font.height + 2, "rgb(32, 192, 64)", undefined, 2);
            this.addChild(this.highlight);
            this.highlight.visible = false;

            this.names = new chs.ClipRect(2, this.topLabel.height + 2, this.width - 42, chs.desktop.height - this.topLabel.height - 2);
            this.addChild(this.names);

            this.scores = new chs.ClipRect(this.width - 38, this.names.y, 38, this.names.height);
            this.addChild(this.scores);

            this.age = 0;
            this.requestInProgress = false;
        },

        updateLB: function() {

            // get the LB from the web service
            // populate the names and scores...
            // highlight your score
            if (!this.requestInProgress && this.game.board_id) {
                chs.WebService.get("leaderboard", { board_id: this.game.board_id, buffer: 10 }, function (data) {
                    var i,
                        y,
                        row;
                    if (data.error === undefined) {
                        // { leaderboard: [ {name: 'Charlie Skilbeck', score: 123L, rank: 32, user_id: 5 }, ...]}
                        this.highlight.visible = false;
                        this.names.removeChildren();
                        this.scores.removeChildren();
                        y = 0;
                        for(i in data.leaderboard) {
                            row = data.leaderboard[i];
                            if (row.user_id == chs.User.id) {
                                this.highlight.setPosition(0, y - 2 + this.names.y);
                                this.highlight.visible = true;
                            }
                            this.names.addChild(new chs.Label(row.name, this.font).setPosition(0, y));
                            this.scores.addChild(new chs.Label(row.score.toString(), this.font).setPosition(0, y));
                            y += this.font.height;
                            if (y > this.names.height) {
                                break;
                            }
                        }
                    }
                }, this);
            }

        },

        onUpdate: function (time, deltaTime) {
            // call webservice, get LB, update names and scores
            this.age += deltaTime;

            if(this.age > 10000) {
                this.age = 0;
                this.updateLB();
            }
        }

    });

} ());
