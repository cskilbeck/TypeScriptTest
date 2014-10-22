(function () {
    "use strict";

    var loader,
        globalLoader,
        consolas,
        consolasItalic,
        gameLabel,
        timeLabel,

        UserImage = glib.Class({ inherit$: [glib.Button, glib.Drawable],

            $: function (x, y, width, height, url) {
                glib.Button.call(this);
                glib.Drawable.call(this);
                this.loader = new glib.Loader("");
                this.width = width;
                this.height = height;
                this.org = { x: x, y: y };
                this.setPosition(x, y);
                this.clipRect = new glib.ClipRect(0, 0, this.width, this.height, 14);
                this.addChild(this.clipRect);
                this.image = new glib.Image(url);
                this.clipRect.addChild(this.image);
                this.border = new glib.OutlineRectangle(0, 0, this.width, this.height, this.clipRect.radius, "black", 3);
                this.addChild(this.border);
                this.onIdle = function () { this.setPosition(this.org.x, this.org.y); this.border.lineColour = "black"; };
                this.onHover = function () { this.setPosition(this.org.x, this.org.y); this.border.lineColour = "white"; };
                this.onPressed = function () { this.setPosition(this.org.x + 1, this.org.y + 1); this.border.lineColour = "white"; };
            },

            onUpdate: function(time, deltaTime) {
                if(this.image.loaded) {
                    this.image.scaleTo(this.width, this.height);
                }
            }
        });

    mtw.MainMenu = glib.Class({ inherit$: glib.Drawable,

        $: function () {
            glib.Drawable.call(this);
            mtw.User.id = 0;
            this.enabled = false;
            this.visible = false;
            this.size = glib.Playfield.Size;
            loader = new glib.Loader('img/');
            glib.Playfield.Root.addChild(loader);
            consolasItalic = glib.Font.load("Consolas_Italic", loader);
            consolas = glib.Font.load("Consolas", loader);
            mtw.BoardTile.load(loader);
            mtw.Dictionary.init(loader.load("words.json"));
            this.game = new mtw.Game(this, loader);
            this.game.addEventHandler("closed", this.activate, this);
            loader.addEventHandler("complete", this.loadComplete, this);
            loader.start();
        },

        logout: function () {
            glib.Cookies.remove('provider_id');
            glib.Cookies.remove('session_id');
            glib.Cookies.remove('login_error');
            window.location.reload();
            this.panel.removeChildren();
            this.panel.addChild(new glib.Label("Logging out...", consolasItalic).setPosition(this.panel.width / 2, this.panel.height / 2).setPivot(0.5, 0.5));
        },

        getSession: function () {
            var session_id = glib.Cookies.get('session_id'),
                provider_id = glib.Cookies.get('provider_id'),   // this will be null if nothing chosen or 0 if Anon or valid provider ID
                login_error = glib.Cookies.get('login_error');
            provider_id = provider_id ? parseInt(provider_id, 10) : 0;
            if (provider_id === 0) {
                if (login_error !== null) {
                    this.panel.addChild(new glib.Label("Login error: " + login_error, consolas).setPosition(this.panel.width - 24, 16).setPivot(1, 0));
                    alert(login_error);
                    glib.Cookies.remove("login_error");
                }
            }
            if (session_id !== null) {
                glib.WebService.get('session', { session_id: session_id }, function (data) {
                    var logoutButton;
                    if (!data || data.error !== undefined) {
                        glib.Cookies.remove('session_id');
                        glib.Cookies.remove('login_error');
                        // session probably expired...
                        if(provider_id !== 0) {
                            window.location.reload();
                        } else {
                            // weird:
                        }
                    } else {
                        mtw.User.id = data.user_id;
                        mtw.User.name = data.name;
                        mtw.User.picture = data.picture;
                        mtw.User.providerName = data.providerName;
                        if(mtw.User.picture) {
                            logoutButton = new UserImage(12, 12, 64, 64, mtw.User.picture);
                        } else {
                            logoutButton = new glib.TextButton(mtw.User.name, consolasItalic, 12, 12, 20, 35);
                        }
                        this.panel.addChild(logoutButton);
                        this.panel.addChild(new glib.Label(provider_id === 0 ? "Log in" : "Log out", consolas).setPosition(44, 84).setPivot(0.5, 0));
                        logoutButton.addEventHandler("clicked", function () {
                            if(provider_id === 0) {
                                this.showLogin();
                            } else {
                                this.addChild(
                                    new glib.MessageBox(
                                        "You are logged in as " + mtw.User.name + " with " + mtw.User.providerName + ", would you like to log out?",
                                        consolasItalic,
                                        ['Yes, log me out', 'No'],
                                        function (button) {
                                            if(button === 0) {
                                                this.logout();
                                            }
                                        }, this, consolas));
                            }
                        }, this);
                    }
                }, this);
            }
        },

        scheduleGameUpdate: function () {
            this.addChild(new glib.Timer(2, 0, this.updateGame, this));
        },

        updateGame: function () {
            glib.WebService.get('game', {}, function (data) {
                var remaining_time,
                    last_snapshot_time,
                    remainder,
                    hours,
                    minutes,
                    seconds;
                if (data && !data.error) {
                    this.seed = data.seed;
                    this.game_id = data.game_id;
                    this.now = Date.parse(data.now);
                    this.game_ends = Date.parse(data.end_time);
                    remainder = this.game_ends - this.now;          // how much time left in this game
                    if (remainder > 0) {
                        last_snapshot_time = glib.Timer.time;
                        gameLabel.text = "Game " + this.game_id.toString();
                        this.addChild(new glib.Timer(0, 1, function() {
                            var elapsed = glib.Timer.time - last_snapshot_time,
                                remain = new Date(remainder - elapsed),
                                hours = remain.getHours();
                                minutes = remain.getMinutes();
                                seconds = remain.getSeconds();
                            if (elapsed < remainder) {
                                timeLabel.text = glib.Util.format("{0}:{1}:{2} remaining",
                                                    glib.Util.pad(hours, 2),
                                                    glib.Util.pad(minutes, 2),
                                                    glib.Util.pad(seconds, 2));
                            } else {
                                console.log("elapsed: " + elapsed.toString() + ", remainder: " + remainder.toString());
                                gameLabel.text = "Game ended..." + remain.toString();
                                this.scheduleGameUpdate();
                                return false;
                            }
                            // now and again, get the top words list
                            glib.WebService.get('gameInfo', { game_id: this.game_id }, function(data) {
                                console.log(data.topWords.length);
                            }, this);
                        }, this));
                    } else {
                        gameLabel.text = "Game ended..." + remainder.toString();
                        this.scheduleGameUpdate();
                    }
                } else {
                    gameLabel.text = "Error getting game, retrying...";
                    this.scheduleGameUpdate();
                }
            }, this);
        },

        loadComplete: function () {
            var session_id = glib.Cookies.get('session_id'),
                provider_id = glib.Cookies.get('provider_id'),   // this will be null if nothing chosen or 0 if Anon or valid provider ID
                login_error = glib.Cookies.get('login_error'),
                buttons = [
                    "Options",
                    "How to play",
                    "Credits"
                ],
                callbacks = [
                    this.showOptions,
                    this.showHowToPlay,
                    this.showCredits
                ],
                w = this.width,
                h = this.height,
                pw = w / 1.05,
                ph = h / 1.05;

            this.game.loadComplete();
            provider_id = provider_id ? parseInt(provider_id, 10) : 0;
            glib.Playfield.Root.removeChild(loader);
            this.panel = new glib.OutlineRectangle(w / 2, h / 2, pw, ph, 25, "white", 4).setPivot(0.5, 0.5);
            this.button = new glib.TextButton("PLAY!", consolasItalic, pw / 2, ph / 2, 200, 50, this.playClicked, this).setPivot(0.5, 0.5);
            this.button.onUpdate = function (time, deltaTime) {
                this.rotation = Math.pow(Math.sin(time), 16) * Math.sin(time * 40) * 0.05;
            };
            this.panel.addChild(this.button);
            this.addChild(this.panel);
            this.panel.addChild(new glib.Menu(20, this.panel.height - 20, consolasItalic, buttons, callbacks, this).setPivot(0, 1));
            this.enabled = true;
            this.visible = true;
            mtw.OAuth.login(this.getSession, this);
            gameLabel = new glib.Label("", consolas).setPosition(this.panel.width - 24, 20).setPivot(1, 0);
            timeLabel = new glib.Label("", consolas).setPosition(this.panel.width - 24, 50).setPivot(1, 0);
            this.panel.addChild(gameLabel);
            this.panel.addChild(timeLabel);
            this.updateGame();
        },

        showLogin: function () {
            var loginScreen = new mtw.LoginScreen(loader, this);
            loginScreen.addEventHandler("closed", this.activate, this);
            this.activate(false);
            this.addSibling(loginScreen);
        },

        playClicked: function () {
            this.activate(false);
            this.addSibling(this.game);
            this.game.init(this.game_id, this.seed);              // ask the web service for the right game to play, then init with the seed...
        },

        activate: function (activate) {
            this.enabled = activate === undefined ? true : activate;
            this.visible = activate === undefined ? true : activate;
        }
    });

}());