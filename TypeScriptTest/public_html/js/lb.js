(function () {
    "use strict";

    mtw.LeaderBoard = chs.Class({
        inherit$: [chs.Panel],

        $: function (font, game) {
            var rankWidth,
                nameWidth,
                scoreWidth;

            rankWidth = font.measureText("999").width + 16;
            nameWidth = font.measureText("Charlie Skilbeck").width + 16;
            scoreWidth = font.measureText("999").width + 16;

            chs.Panel.call(this, 16, 16, rankWidth + nameWidth + scoreWidth, chs.desktop.height - 32, "rgb(16, 16, 16)", "white", 16, 3, 255);

            this.game = game;
            this.font = font;

            this.topLabel = new chs.Label("NN of NN", font).setPosition(this.width / 2, 8).setPivot(0.5, 0);
            this.addChild(this.topLabel);

            this.highlight = new chs.Panel(4, 0, this.width - 8, this.font.height + 6, "darkslategrey", undefined, 4);
            this.addChild(this.highlight);
            this.highlight.visible = false;

            this.ranks = new chs.ClipRect(8, this.topLabel.height + 16, rankWidth, this.height - this.topLabel.height - 16);
            this.addChild(this.ranks);

            this.scores = new chs.ClipRect(this.width - scoreWidth, this.ranks.y, scoreWidth, this.ranks.height);
            this.addChild(this.scores);

            this.names = new chs.ClipRect(rankWidth + 8, this.ranks.y, this.width - (rankWidth + scoreWidth + 8), this.ranks.height);
            this.addChild(this.names);

            this.age = 0;
            this.requestInProgress = false;
        },

        updateLB: function() {

            // get the LB from the web service
            // populate the names and scores...
            // highlight your score
            if (!this.requestInProgress && this.game.board_id) {
                this.requestInProgress = true;
                chs.WebService.get("leaderboard", { board_id: this.game.board_id, buffer: 10 }, function (data) {
                    var i,
                        y,
                        row;
                    this.requestInProgress = false;
                    if (data.error === undefined) {
                        // { leaderboard: [ {name: 'Charlie Skilbeck', score: 123L, rank: 32, user_id: 5 }, ...]}
                        this.highlight.visible = false;
                        this.ranks.removeChildren();
                        this.names.removeChildren();
                        this.scores.removeChildren();
                        y = 0;
                        for(i in data.leaderboard) {
                            row = data.leaderboard[i];
                            if (row.user_id == chs.User.id) {
                                this.highlight.setPosition(4, y - 5 + this.names.y);
                                this.highlight.visible = true;
                                this.topLabel.text = row.rank.toString() + " of " + data.total.toString();
                            }
                            this.ranks.addChild(new chs.Label(row.rank.toString(), this.font).setPosition(2, y));
                            this.names.addChild(new chs.Label(row.name, this.font).setPosition(2, y));
                            this.scores.addChild(new chs.Label(row.score.toString(), this.font).setPosition(2, y));
                            y += this.font.height + 6;
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
            this.age -= deltaTime;

            if(this.age <= 0) {
                this.age = 2000;
                this.updateLB();
            }
        }

    });

} ());
