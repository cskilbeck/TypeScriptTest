//////////////////////////////////////////////////////////////////////
// LB and hot word starts on the main menu
// change the client_secrets!
// fix the dbaseconfig problem
// new words each day...
// Fix tile grabbing/moving/swapping/lerping/tap to swap
// menu button repositioned working on phone
// font: layermask, composited labels all wonky
// munger: piece ({{term}}) / body <span id='group'> / meal (senseid, en, food) / field (senseid) / coastal (cx, geography) / daub (cx) / source (,) / eyen (Category) / torr <sup> / meg (SI prefix) / ai (l/en)
// make all drawables compositable?
// make login robust
// loader outputs manifest with file sizes for proper progress bar
// fix font util (combine channels plugin)
// Mobile:
//      viewport/scaling
//      wordlist/highscores
//      dynamic layout
//      deflate/gzip js and json
//      orientation
// Flying scores/fizz/particles
// scrollable leaderboards
// scrollable textbox
// track word usage in the database
//   you and ## other people found this word
//   you were the Nth person to find this word
//   this word is the Nth most common word today
//   etc
//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var consolas,
        consolasItalic,
        consolasItalicBold,
        calibri,
        arial,
        words,
        scoreButton,
        bestButton,
        bestScore,
        retry = false,
        ui,
        menu,
        currentScore,
        leaderBoard,
        bestLabel,
        board;

    //////////////////////////////////////////////////////////////////////

    mtw.Game = glib.Class({ inherit$: glib.Drawable,

        $: function (mainMenu, loader) {
            glib.Drawable.call(this);
            this.size = { width: glib.Playfield.Width, height: glib.Playfield.Height };
            this.mainMenu = mainMenu;
            this.game_id = 0;
            consolas = glib.Font.load("Consolas", loader);
            arial = glib.Font.load("Arial", loader);
            consolasItalic = glib.Font.load("Consolas_Italic", loader);
            consolasItalicBold = glib.Font.load("Consolas_Italic", loader);
            calibri = glib.Font.load("Calibri", loader);
            this.board_id = 0;
            ui = new mtw.UI(loader);
        },

        loadComplete: function() {

            consolasItalic.lineSpacing = 10;
            consolasItalic.softLineSpacing = 4;
            consolasItalic.mask = 2;
            consolasItalicBold.softLineSpacing = 4;

            ui.loadComplete();
            ui.addEventHandler("undo", this.undo, this);
            ui.addEventHandler("redo", this.redo, this);
            this.addChild(ui);

            words = new glib.Drawable();
            words.width = ui.client.width;
            words.height = ui.client.height;

            scoreButton = new glib.PanelButton(ui.client.width / 2, 0, ui.client.width, consolas.height + 8, 'black', glib.none, 3, 0, null, null).setPivot(0.5, 0);
            scoreButton.scoreLabel = new glib.Label("0", consolas).setPosition(scoreButton.width - 4, 4).setPivot(1, 0);
            scoreButton.addChild(scoreButton.scoreLabel);
            scoreButton.addChild(new glib.Label("Score:", consolas).setPosition(4, 4));
            words.addChild(scoreButton);
            scoreButton.highlight = 0;
            scoreButton.compose();

            scoreButton.flash = function (color) {
                this.fillColour = color;
                this.highlight = 500;
                this.compose();
            };

            scoreButton.setScore = function (score) {
                this.scoreLabel.text = score.toString();
                if(score > currentScore) {
                    this.flash("rgb(0,255,0)");
                } else if(score < currentScore) {
                    this.flash("rgb(255,0,0)");
                }
                this.compose();
            };

            scoreButton.onUpdate = function (time, deltaTime) {
                if(this.highlight > 0) {
                    this.highlight -= deltaTime;
                    if(this.highlight <= 0) {
                        this.fillColour = "black";
                        this.compose();
                    }
                }
            };

            bestButton = new glib.PanelButton(ui.client.width / 2, scoreButton.height + 2, ui.client.width, consolas.height + 8, 'black', glib.none, 3, 0, this.bestClicked, this).setPivot(0.5, 0);
            bestLabel = new glib.Label("0", consolas).setPosition(bestButton.width - 4, 4).setPivot(1, 0);
            bestButton.addChild(bestLabel);
            bestButton.addChild(new glib.Label("Best:", consolas).setPosition(4, 4));
            bestButton.highlight = 0;
            bestButton.flash = 0;

            bestButton.onIdle = function () { this.fillColour = 'black'; this.compose(); };
            bestButton.onHover = function () { this.fillColour = 'black'; this.compose(); };
            bestButton.onPressed = function () { this.fillColour = 'red'; this.compose(); };
            bestButton.onUpdate = function (time, deltaTime) {
                if (this.highlight > 0) {
                    this.highlight -= deltaTime;
                    if(this.highlight > 0) {
                        this.flash += 1;
                        if ((this.flash % 4) !== 0) {
                            this.fillColour = "rgb(0,255,0)";
                            this.compose();
                        } else {
                            this.fillColour = "black";
                            this.compose();
                        }
                    } else {
                        this.flash = 0;
                        this.fillColour = "black";
                        this.compose();
                    }
                }
            };
            words.addChild(bestButton);
            words.title = "Words";
            words.wordList = new glib.Drawable().setPosition(0, bestButton.height + bestButton.y + 4);
            words.addChild(words.wordList);
            ui.addScreen(words);

            leaderBoard = new mtw.LeaderBoard(calibri, this.game_id, ui.client.width, ui.client.height);
            leaderBoard.title = "Leaderboard";
            ui.addScreen(leaderBoard);

            menu = new glib.Menu(ui.client.width / 2, 8, consolas,
                [
                    "Quit",
                    "Shuffle!"
                ], [
                    this.closeIt,
                    this.shuffle
                ],
                this).setPivot(0.5, 0);
            menu.title = "Menu";
            ui.addScreen(menu);

            board = new mtw.BoardGame(0, 0, this, true);
            this.addChild(board);
            bestScore = 0;

            board.addEventHandler("changed", this.updateWordList, this);

            board.addEventHandler("movecomplete", function () {
                currentScore = board.score;
            });
        },

        onDraw: function (context) {
            // var ext = arial.measureText("W");
            // arial.renderString(context, "W", 688, 350);
            // glib.Debug.rect(688 + ext.left, 350 + ext.top, (ext.right - ext.left), (ext.bottom - ext.top));
        },

        //////////////////////////////////////////////////////////////////////
        // new game starting

        init: function (game_id, seed) {
            this.game_id = game_id;
            board.randomize(seed);
            board.load();
            this.updateWordList();

            // right, if there's a user logged in, try and get their board for this game
            // but only splat into the board if this is the first time they've played this session...
            if(mtw.User.id !== 0) {
                // disable play until this comes back, either way
                glib.WebService.get("game", { seed: seed, user_id: mtw.User.id }, function (data) {
                    if(data && !data.error) {
                        if (data.score > bestScore) {
                            this.board_id = data.board_id;
                            board.bestScore = data.score;
                            board.bestBoard = data.board;
                            board.bestSeed = seed;
                            bestScore = board.bestScore;
                            bestLabel.text = board.bestScore.toString();    // if board.bestScore has gone up, flash this!
                            bestButton.compose();
                            bestButton.highlight = 0.5;
                            leaderboard.board_id = data.board_id;
                            leaderBoard.doUpdate();
                        } else {

                        }
                    } else {
                        // new game, probly
                    }
                }, this);
            }
        },

        //////////////////////////////////////////////////////////////////////

        bestClicked: function () {
            var brd,
                msgBox,
                btns,
                goBack,
                msg;
            if (board.bestScore === board.score && board.score > 0) {
                msg = "This is your best score so far! You can get back to it later by clicking on the best score button again...";
                btns = ['Ok'];
                goBack = function () {

                };
            } else if (board.bestBoard !== "") {
                msg = "Go back to your best score? This can be undone, so feel free...";
                btns = ['Yes', 'No'];
                goBack = function (idx) {
                    if (idx === 0) {
                        board.setFromString(board.bestBoard);
                        this.updateWordList();
                        board.pushUndo();
                    }
                };
            }
            if (msg) {
                msgBox = new glib.MessageBox(msg, consolasItalicBold, btns, goBack, this);
                brd = new mtw.BoardGame(0, 0, this, false);
                brd.setFromString(board.bestBoard);
                brd.setScale(0.5);
                brd.setPivot(0.5, 0);
                msgBox.window.height += brd.height * 0.5;
                brd.setPosition(msgBox.window.width / 2, Math.floor(msgBox.window.textBox.height + msgBox.window.textBox.y + 16) + 0.5);    // 16 is magic button offset number
                msgBox.window.client.addChild(brd);
                this.addChild(msgBox);
            }
        },

        //////////////////////////////////////////////////////////////////////

        onClosed: function () {
            if (this.mainBoard) {
                glib.Cookies.set("game", board.seed, 10);
                glib.Cookies.set("board", board.getAsString(), 10);
            }
        },

        //////////////////////////////////////////////////////////////////////

        shuffle: function () {
            this.addChild(new glib.MessageBox("Really shuffle? You can undo it...", consolas, ['Yes', 'No'], function (idx) {
                var i,
                    r,
                    n;
                if (idx === 0) {
                    r = new glib.Random();
                    board.beforeDrag = board.getAsString();
                    for (i = 0; i < board.tiles.length - 1; ++i) {
                        n = i + (r.next() % (board.tiles.length - 1 - i));
                        board.tiles[i].swap(board.tiles[n]);
                    }
                    board.markAllWords();
                    this.updateWordList();
                    board.saveBest();
                    board.pushUndo();
                    this.setDirty();
                }
            }, this));
        },

        //////////////////////////////////////////////////////////////////////

        closeIt: function () {
            this.addChild(new glib.MessageBox("Really quit?", consolas, ['Yes, quit', 'No'], function (idx) {
                if (idx === 0) {
                    this.close();
                }
            }, this));
        },

        //////////////////////////////////////////////////////////////////////

        undo: function () {
            board.undo();
            this.updateWordList();
        },

        //////////////////////////////////////////////////////////////////////

        redo: function () {
            board.redo();
            this.updateWordList();
        },

        //////////////////////////////////////////////////////////////////////

        showDefinition: function (w) {
            var def,
                win,
                scoreLabel,
                textBox,
                netWorkIndicator,
                networkInprogress = false,
                getDef = function(word) {
                    netWorkIndicator.age = 0;
                    networkInprogress = true;
                    glib.WebService.get("definition", { word: word }, function (data) {
                        netWorkIndicator.rotation = 0;
                        networkInprogress = false;
                        if (data && !data.error) {
                            textBox.text = data.definition;
                        }
                    });
                };

            win = new glib.Window({
                x: glib.Playfield.Width / 2,
                y: glib.Playfield.Height / 2,
                width: glib.Playfield.Width * 0.85,
                height: glib.Playfield.Height * 0.95,
                caption: w.str.toUpperCase(),
                captionScale: 0.5,
                font: arial,
                cornerRadius: 16,
                backgroundColour: "black",
                closeButton: true,
                draggable: true,
                border: true,
                borderColour: "white",
                borderWidth: 4,
                backgroundTransparency: 236,
                modal: true
            });

            win.setPivot(0.5, 0.5);
            win.setScale(0.75);
            win.age = 0.5;
            win.onUpdate = function (time, deltaTime) {
                var a;
                if (this.age < 1) {
                    this.age += deltaTime * 1.3333;
                    if (this.age > 1) {
                        this.age = 1;
                    }
                    a = glib.Util.ease(glib.Util.ease(this.age));
                    this.rotation = (a - 1) * 3.14159265 * 0.5;
                    this.setScale(a);
                    this.transparency = (this.age - 0.5) * 510;
                }
                if(networkInprogress) {
                    netWorkIndicator.age += deltaTime * 6.6666666667;
                    netWorkIndicator.rotation = netWorkIndicator.age + Math.sin(netWorkIndicator.age * 2) * 0.5 + Math.PI / 2;
                }
            };

            netWorkIndicator = new glib.OutlineRectangle(0, 0, 16, 16, 3, "white", 1.5).setPivot(0.5, 0.5).setPosition(22, 22);
            netWorkIndicator.age = 0;
            netWorkIndicator.addChild(new glib.SolidRectangle(4, 4, 8, 8, 2, "white"));
            win.addChild(netWorkIndicator);

            scoreLabel = new glib.Label(w.score.toString() + " points", consolasItalic);
            textBox = new glib.TextBox(16, 16, win.client.width - 32, win.client.height - 32, "...", consolasItalic, '\r    ', function (link) {
                win.text = link.toUpperCase();
                scoreLabel.text = mtw.Letters.getWordScore(link).toString() + " points";
                getDef(link);
            });
            getDef(w.str);
            scoreLabel.setPosition(win.titleBar.width - 16, win.titleBar.height / 2);
            scoreLabel.setPivot(1, consolasItalic.midPivot);
            win.titleBar.addChild(scoreLabel);
            win.client.addChild(textBox);
            win.caption.move(17, 0);
            this.addChild(win);
        },

        //////////////////////////////////////////////////////////////////////

        updateWordList: function () {
            var y = 0,
                w,
                c,
                i,
                button,
                l;
            for (i = 0, l = words.wordList.drawableData.children.length; i < l; ++i) {
                c = words.wordList.drawableData.children[i];
                mtw.WordButton.dispose(c);
            }
            words.wordList.removeChildren();
            for (i = 0, l = board.words.length; i < l; ++i) {
                w = board.words[i];
                button = mtw.WordButton.create(w, board, this, ui.client.width / 2, y, ui.client.width - 8, consolas.height + 6, consolas).setPivot(0.5, 0);
                y += button.height + 1;
                words.wordList.addChild(button);
            }
            board.changed = false;
            scoreButton.setScore(board.score);
            bestLabel.text = board.bestScore.toString();    // if board.bestScore has gone up, flash this!

            if (board.bestScore > bestScore || retry) {
                bestButton.highlight = 0.5;
                bestScore = board.bestScore;
                if(mtw.User.id) {
                    glib.WebService.post("board", {}, { board: board.getAsString(), user_id: mtw.User.id, game_id: this.game_id, seed: board.seed }, function (data) {
                        if (data && !data.error) {
                            leaderBoard.board_id = data.board_id;
                            this.board_id = data.board_id;  // for LB tracking
                            leaderBoard.doUpdate();
                            retry = false;
                        } else {
                            if (data !== null) {
                                console.log("Error! " + data.error.toString());
                            } else {
                                console.log("No data");
                            }
                            retry = true;
                        }
                    }, this);
                }
            }
        }
    });

}());
