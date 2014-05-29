(function () {
    "use strict";

    mtw.LeaderBoard = chs.Class({ inherit$: chs.Drawable,

        $: function (font, game_id, width, height) {
            var rankWidth,
                nameWidth,
                scoreWidth;

            rankWidth = font.measureText("999").width;
            nameWidth = font.measureText("Charlie Skilbeck").width;
            scoreWidth = font.measureText("999.").width;

            chs.Drawable.call(this);
            this.size = { width: width, height: height };

            this.game_id = game_id;
            this.board_id = 0;
            this.font = font;

            this.topLabel = new chs.Label("", font).setPosition(this.width / 2, 8).setPivot(0.5, 0);
            this.addChild(this.topLabel);

            this.highlight = new chs.Panel(0, 0, this.width, this.font.height + 6, "darkslategrey", undefined, 4);
            this.addChild(this.highlight);
            this.highlight.visible = false;

            this.ranks = new chs.ClipRect(0, this.topLabel.height + 16, rankWidth, this.height - this.topLabel.height - 16);
            this.addChild(this.ranks);

            this.scores = new chs.ClipRect(this.width, this.ranks.y, scoreWidth, this.ranks.height);
            this.scores.setPivot(1, 0);
            this.addChild(this.scores);

            this.names = new chs.ClipRect(rankWidth, this.ranks.y, this.width - (rankWidth + scoreWidth + 2), this.ranks.height);
            this.addChild(this.names);

            this.delay = 0;
            this.requestInProgress = false;
        },

        setUpdateFrequency: function (f) {
            this.addChild(new chs.Timer(f, f, this.update, this));
        },

        doUpdate: function() {

            if (!this.requestInProgress) {
                this.requestInProgress = true;
                var params = {
                    board_id: this.board_id,
                    offset: -10,
                    page_size: 20,
                    game_id: this.game_id
                };
                chs.WebService.get("leaderboard", params, function (data) {
                    var i,
                        y,
                        row;
                    this.requestInProgress = false;
                    if (data && data.error === undefined) {
                        // { leaderboard: [ {name: 'Charlie Skilbeck', score: 123L, rank: 32, user_id: 5 }, ...]}
                        this.highlight.visible = false;
                        this.ranks.removeChildren();
                        this.names.removeChildren();
                        this.scores.removeChildren();
                        y = 0;
                        for(i in data.leaderboard) {
                            row = data.leaderboard[i];
                            if (row.user_id == chs.User.id) {
                                this.highlight.setPosition(0, y - 5 + this.names.y);
                                this.highlight.visible = true;
                                this.topLabel.text = row.rank.toString() + " of " + data.total.toString();
                            }
                            this.ranks.addChild(new chs.Label(row.rank.toString(), this.font).setPosition(2, y));
                            this.names.addChild(new chs.Label(row.name, this.font).setPosition(2, y));
                            this.scores.addChild(new chs.Label(row.score.toString(), this.font).setPosition(2, y));
                            y += this.font.height + 2;
                            if (y > this.names.height) {
                                break;
                            }
                        }
                    }
                }, this);
            }
        }

    });

} ());
