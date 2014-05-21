//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var tileWidth = 96,
        tileHeight = 96,
        font,
        digits,
        tileImage;

    //////////////////////////////////////////////////////////////////////

    mtw.BoardTile = chs.Class({ inherit$: [mtw.Tile, chs.Composite, chs.Drawable],

        static$: {

            width: tileWidth,
            height: tileHeight,

            load: function (loader) {
                font = chs.Font.load("Arial", loader);
                digits = chs.Font.load("digits", loader);
                tileImage = loader.load("allColour.png");
            }
        },

        $: function (letter, x, y, showDigits) {
            mtw.Tile.call(this, letter);
            chs.Composite.call(this);
            chs.Drawable.call(this);
            this.font = font;
            this.selected = false;
            this.swapped = false;
            this.setPivot(0.5, 0.5);
            this.width = tileWidth;
            this.height = tileHeight;
            this.setPosition(x * tileWidth + tileWidth / 2, y * tileHeight + tileHeight / 2);
            this.org = {
                x: this.position.x,
                y: this.position.y
            };
            this.target = {
                x: this.position.x,
                y: this.position.y
            };
            this.source = {
                x: this.position.x,
                y: this.position.y
            };
            this.lerpTime = 100;
            this.moveTime = 0;
            this.sprite = new chs.Sprite(tileImage);
            this.sprite.framesWide = 5;
            this.sprite.framesHigh = 5;
            this.sprite.frameWidth = tileWidth;
            this.sprite.frameHeight = tileHeight;
            this.addChild(this.sprite);
            this.label = new chs.Label(letter, font).setPivot(0.5, font.midPivot);
            this.label.setPosition(this.width / 2 - 1, this.height / 2);
            this.label.transparency = 224;
            if (showDigits) {
                this.digits = new chs.Label(mtw.Letters.letterScore(letter).toString(), digits).setPivot(1, 1).setPosition(this.width - 12, this.height - 8);
                this.digits.transparency = 96;
                this.sprite.addChild(this.digits);
            } else {
                this.digits = null;
            }
            this.sprite.addChild(this.label);
            this.oldfX = -1;
            this.oldfY = -1;
            this.compose();
        },

        //////////////////////////////////////////////////////////////////////

        letter: chs.Property({
            get: function () {
                return this.myLetter;
            },
            set: function (s) {
                this.myLetter = s;
                this.label.text = s.toUpperCase();
                if (this.digits) {
                    this.digits.text = mtw.Letters.letterScore(s).toString();
                }
                this.compose();
            }
        }),

        //////////////////////////////////////////////////////////////////////

        setOrigin: function (x, y) {
            this.org.x = x;
            this.org.y = y;
        },

        //////////////////////////////////////////////////////////////////////

        setTarget: function (x, y, lerpTime) {
            this.source.x = this.position.x;
            this.source.y = this.position.y;
            this.target.x = x;
            this.target.y = y;
            this.lerpTime = lerpTime;
            this.moveTime = lerpTime;
            if(!lerpTime) {
                this.setPosition(x, y);
            }
        },

        //////////////////////////////////////////////////////////////////////
        // put it back to its origin

        resetPosition: function () {
            this.setTarget(this.org.x, this.org.y, 50);
//            this.setPosition(this.org.x, this.org.y);
        },

        //////////////////////////////////////////////////////////////////////
        // reset everything

        reset: function () {
            this.resetPosition();
            this.selected = false;
            this.swapped = false;
            this.zIndex = 0;
        },

        //////////////////////////////////////////////////////////////////////

        swap: function (b) {
            var t = b.letter;
            b.letter = this.letter;
            this.letter = t;
        },

        //////////////////////////////////////////////////////////////////////

        onUpdate: function (time, deltaTime) {
            var t,
                x,
                y,
                hi = this.wordIndices[mtw.Word.horizontal],
                vi = this.wordIndices[mtw.Word.vertical],
                sx = hi.position,
                sy = vi.position;
            if (hi.word === null && vi.word === null) {
                sx = 0;
                sy = 4;
            }
            if (this.swapped) {
                sx = 4;
                sy = 2;
            }
            if (this.selected) {
                this.setScale(1.2);
                sx = 4;
                sy = 0;
            } else {
                this.setScale(1);
            }
            if(this.oldfX !== sx || this.oldfY !== sy) {
                this.sprite.setFrameXY(sx, sy);
                this.oldfX = sx;
                this.oldfY = sy;
                this.compose();
            }
            // move towards target
            if(this.moveTime > 0) {
                this.moveTime -= deltaTime;
                if(this.moveTime < 0) {
                    this.moveTime = 0;
                }
                // 0 : at target
                // N : at position
                t = chs.Util.ease(chs.Util.ease(this.moveTime / this.lerpTime));
                x = (this.source.x - this.target.x) * t + this.target.x;
                y = (this.source.y - this.target.y) * t + this.target.y;
                this.setPosition(x, y);
            }
        }
    });

}());