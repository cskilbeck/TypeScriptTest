//////////////////////////////////////////////////////////////////////
// make login robust
// fix font util (combine channels plugin)
// Mobile:
//      viewport/scaling
//      touch input
//      wordlist/highscores
//      dynamic layout
// Fix tile grabbing/moving/swapping/lerping
// Flying scores/fizz/particles
//////////////////////////////////////////////////////////////////////

var Game = (function () {
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
        currentScore,
        leaderBoard,
        bestLabel,
        board,
        undoImage,
        redoImage,
        highlightWords = [],
        deHighlightWords = [],
        menuButton;

    //////////////////////////////////////////////////////////////////////

    function setWordHightlight(word, h) {
        var i;
        for (i = 0; i < word.str.length; i++) {
            board.getWordTile(word, i).pulse = h;
        }
    }

    //////////////////////////////////////////////////////////////////////

    return chs.Class({
        inherit$: [chs.Drawable],

        $: function (mainMenu, loader) {
            chs.Drawable.call(this);
            this.dimensions = { width: 800, height: 600 };
            this.mainMenu = mainMenu;
            consolas = chs.Font.load("Consolas", loader);
            arial = chs.Font.load("Arial", loader);
            consolasItalic = chs.Font.load("Consolas_Italic", loader);
            consolasItalicBold = chs.Font.load("Consolas_Italic", loader);
            calibri = chs.Font.load("Calibri", loader);
            undoImage = loader.load("undo.png");
            redoImage = loader.load("redo.png");
            this.board_id = 0;
        },

        loadComplete: function () {
            consolasItalic.lineSpacing = 10;
            consolasItalic.softLineSpacing = 4;
            consolasItalic.mask = 2;

            consolasItalicBold.softLineSpacing = 4;

            leaderBoard = new mtw.LeaderBoard(calibri, this);
            this.addChild(leaderBoard);

            menuButton = new chs.TextButton("Menu", consolas, chs.desktop.width / 2, chs.desktop.height - 10, 100, 40, this.menu, this).setPivot(0.5, 1);
            this.addChild(menuButton);

            words = new chs.Drawable().setPosition(chs.desktop.width - 125, 70);
            this.addChild(words);

            this.addChild(new chs.SpriteButton(undoImage, "scale", 900, 530, this.undo, null));
            this.addChild(new chs.SpriteButton(redoImage, "scale", 950, 530, this.redo, null));

            scoreButton = new chs.PanelButton(chs.desktop.width - 125, 10, 120, 26, 'black', undefined, 3, 0, null, null);
            scoreButton.scoreLabel = new chs.Label("0", consolas).setPosition(116, 4).setPivot(1, 0);
            scoreButton.addChild(scoreButton.scoreLabel);
            scoreButton.addChild(new chs.Label("Score:", consolas).setPosition(4, 4));
            this.addChild(scoreButton);
            scoreButton.highlight = 0;

            scoreButton.flash = function (color) {
                this.fillColour = color;
                this.highlight = 500;
            };

            scoreButton.setScore = function (score) {
                this.scoreLabel.text = score.toString();
                if(score > currentScore) {
                    this.flash("rgb(0,255,0)");
                } else if(score < currentScore) {
                    this.flash("rgb(255,0,0)");
                }
            };

            scoreButton.onUpdate = function (time, deltaTime) {
                if(this.highlight > 0) {
                    this.highlight -= deltaTime;
                    if(this.highlight <= 0) {
                        this.fillColour = "black";
                    }
                }
            };

            bestButton = new chs.PanelButton(chs.desktop.width - 125, 39, 120, 26, 'black', undefined, 3, 0, this.bestClicked, this);
            bestLabel = new chs.Label("0", consolas).setPosition(116, 4).setPivot(1, 0);
            bestButton.addChild(bestLabel);
            bestButton.addChild(new chs.Label("Best:", consolas).setPosition(4, 4));
            bestButton.highlight = 0;
            bestButton.flash = 0;

            bestButton.onIdle = function () { this.fillColour = 'black'; };
            bestButton.onHover = function () { this.fillColour = 'black'; };
            bestButton.onPressed = function () { this.fillColour = 'red'; };
            bestButton.onUpdate = function (time, deltaTime) {
                if (this.highlight > 0) {
                    this.highlight -= deltaTime;
                    if(this.highlight > 0) {
                        this.flash += 1;
                        if ((this.flash % 4) !== 0) {
                            this.fillColour = "rgb(0,255,0)";
                        } else {
                            this.fillColour = "black";
                        }
                    } else {
                        this.flash = 0;
                        this.fillColour = "black";
                    }
                }
            };
            this.addChild(bestButton);

            board = new mtw.BoardGame(chs.desktop.width / 2, 16, this, true).setPivot(0.5, 0);
            this.addChild(board);
            bestScore = 0;

            board.addEventHandler("movecomplete", function () {
                currentScore = board.score;
                console.log("New current score " + currentScore.toString());
            });
        },

        //////////////////////////////////////////////////////////////////////
        // new game starting

        init: function (seed) {
            menuButton.onIdle();
            menuButton.setCapture(false);
            board.randomize(seed);
            board.load();

            // right, if there's a user logged in, try and get their board for this game
            // but only splat into the board if this is the first time they've played this session...
            if(chs.User.id !== 0) {
                // disable play until this comes back, either way
                chs.WebService.get("game", { seed: seed, user_id: chs.User.id }, function (data) {
                    if(data && !data.error) {
                        if (data.score > bestScore) {
                            this.board_id = data.board_id;
                            board.bestScore = data.score;
                            board.bestBoard = data.board;
                            board.bestSeed = seed;
                            bestScore = board.bestScore;
                            bestLabel.text = board.bestScore.toString();    // if board.bestScore has gone up, flash this!
                            bestButton.highlight = 1000;
                            leaderBoard.delay = 1;  // poke a leaderboard update
                        } else {

                        }
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
                        board.pushUndo();
                    }
                };
            }
            if (msg) {
                msgBox = new chs.MessageBox(msg, consolasItalicBold, btns, goBack, this);
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
                chs.Cookies.set("game", board.seed, 10);
                chs.Cookies.set("board", board.getAsString(), 10);
            }
        },

        //////////////////////////////////////////////////////////////////////

        shuffle: function () {
            this.addChild(new chs.MessageBox("Really shuffle? You can undo it...", consolas, ['Yes', 'No'], function (idx) {
                var i,
                    r,
                    n;
                if (idx === 0) {
                    r = new chs.Random();
                    board.beforeDrag = board.getAsString();
                    for (i = 0; i < board.tiles.length - 1; ++i) {
                        n = i + (r.next() % (board.tiles.length - 1 - i));
                        board.tiles[i].swap(board.tiles[n]);
                    }
                    board.markAllWords();
                    board.saveBest();
                    board.pushUndo();
                    this.setDirty();
                }
            }, this));
        },

        //////////////////////////////////////////////////////////////////////

        closeIt: function () {
            this.addChild(new chs.MessageBox("Really quit?", consolas, ['Yes, quit', 'No'], function (idx) {
                if (idx === 0) {
                    this.close();
                }
            }, this));
        },

        //////////////////////////////////////////////////////////////////////

        menu: function () {
            var top = {x: 0, y: 0 };
            menuButton.state = chs.Button.idle;
            top = menuButton.clientToScreen(top);
            this.addChild(new chs.PopupMenu(menuButton.x, top.y - 4, consolas,
                [
                    "Quit",
                    "Shuffle!"
                ], [
                    this.closeIt,
                    this.shuffle
                ],
                this).setPivot(0.5, 1));
        },

        //////////////////////////////////////////////////////////////////////

        undo: function () {
            board.undo();
        },

        //////////////////////////////////////////////////////////////////////

        redo: function () {
            board.redo();
        },

        //////////////////////////////////////////////////////////////////////

        showDefinition: function (w) {
            var def,
                win,
                scoreLabel,
                textBox,
                getDef = function(word) {
                    chs.WebService.get("definition", { word: word }, function (data) {
                        if (data && !data.error) {
                            textBox.text = data.definition;
                        }
                    });
                };

            win = new chs.Window({
                x: chs.desktop.width / 2,
                y: chs.desktop.height / 2,
                width: 640,
                height: 480,
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
                    this.age += deltaTime / 750;
                    if (this.age > 1) {
                        this.age = 1;
                    }
                    a = chs.Util.ease(chs.Util.ease(this.age));
                    this.rotation = (a - 1) * 3.14159265 * 0.5;
                    this.setScale(a);
                    this.transparency = (this.age - 0.5) * 510;
                }
            };

            scoreLabel = new chs.Label(w.score.toString() + " points", consolasItalic);
            textBox = new chs.TextBox(16, 16, 640 - 32, 480 - 32, "...", consolasItalic, '\r    ', function (link) {
                win.text = link.toUpperCase();
                scoreLabel.text = mtw.Letters.getWordScore(link).toString() + " points";
                getDef(link);
            });
            getDef(w.str);
            scoreLabel.setPosition(win.titleBar.width - 16, win.titleBar.height / 2);
            scoreLabel.setPivot(1, consolasItalic.midPivot);
            win.titleBar.addChild(scoreLabel);
            win.client.addChild(textBox);
            this.addChild(win);
        },

        //////////////////////////////////////////////////////////////////////

        updateWordList: function () {
            var y = 0;
            words.removeChildren();
            board.wordList().forEach(function (w) {
                var button = new chs.PanelButton(0, y, 120, 26, "darkslategrey", undefined, 4, 0, function () {
                    button.state = chs.Button.idle;
                    this.showDefinition(w);
                }, this);
                button.addChild(new chs.Label(w.str, consolas).setPosition(5, button.height / 2).setPivot(0, consolas.midPivot));
                button.addChild(new chs.Label(w.score.toString(), consolas).setPosition(114, button.height / 2).setPivot(1, consolas.midPivot));
                button.onIdle = function () {
                    this.fillColour = "darkslategrey";
                    deHighlightWords.push(this.word);
                };
                button.onPressed = function () { this.fillColour = "aquamarine"; };
                button.onHover = function () {
                    this.fillColour = "lightslategrey";
                    highlightWords.push(this.word);
                };
                button.word = w;
                y += button.height + 1;
                words.addChild(button);
            }, this);
            board.changed = false;
            scoreButton.setScore(board.score);
            bestLabel.text = board.bestScore.toString();    // if board.bestScore has gone up, flash this!

            if (board.bestScore > bestScore || retry) {
                bestButton.highlight = 1000;
                bestScore = board.bestScore;
                if(chs.User.id) {
                    chs.WebService.post("board", {}, { board: board.getAsString(), user_id: chs.User.id, seed: board.seed }, function (data) {
                        if (data && !data.error) {
                            leaderBoard.delay = 0;  // poke a leaderboard update
                            this.board_id = data.board_id;  // for LB tracking
                            retry = false;
                        } else {
                            console.log("Error! " + data.error);
                            retry = true;
                        }
                    }, this);
                }
            }
        },

        onUpdate: function (time, deltaTime) {
            var i,
                j;
            if (board.changed) {
                this.updateWordList();
            }

            // remove any from true which are also in false...

            for (i = 0; i < highlightWords.length; ++i) {
                for (j = 0; j < deHighlightWords.length; ++j) {
                    if(highlightWords[i] === deHighlightWords[j]) {
                        highlightWords.splice(i, 1);
                    }
                }
            }

            while(deHighlightWords.length > 0) {
                setWordHightlight(deHighlightWords.shift(), false);
            }
            while(highlightWords.length > 0) {
                setWordHightlight(highlightWords.shift(), true);
            }
        }

    });

}());
