//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    chs.Button = chs.Class({

        static$: {
            idle: 0,
            hover: 1,
            pressed: 2
        },

        $: function (click, context) {
            this.currentState = chs.Button.idle;
            this.callback = click;
            this.context = context || this;
        },

        onHover: function () {
        },

        onIdle: function () {
        },

        onPressed: function () {
        },

        onTouchStart: function () {
            this.state = chs.Button.pressed;
            return true;
        },

        onTouchEnd: function () {
            if(this.state === chs.Button.pressed) {
                this.state = chs.Button.idle;
                this.dispatchEvent("clicked");
                if (this.callback) {
                    this.callback.call(this.context || this);
                }
            }
            return true;
        },

        onTouchExit: function () {
            this.state = chs.Button.idle;
            return true;
        },

        onTouchEnter: function () {
            return true;
        },

        onMouseEnter: function () {
            this.state = chs.Button.hover;
            return true;
        },

        onMouseLeave: function () {
            this.state = chs.Button.idle;
            this.drawableData.touchCapture = false;
            return true;
        },

        onLeftMouseDown: function () {
            this.state = chs.Button.pressed;
            this.drawableData.touchCapture = true;
            return true;
        },

        onLeftMouseUp: function () {
            if (this.state === chs.Button.pressed) {
                this.state = chs.Button.hover;
                this.dispatchEvent("clicked");
                if (this.callback) {
                    this.callback.call(this.context || this);
                }
            }
            return true;
        },

        state: chs.Property({
            get: function () {
                return this.currentState;
            },
            set: function (s) {
                this.currentState = s;
                switch (s) {
                case chs.Button.idle:
                    this.onIdle();
                    //this.drawableData.mouseIsOver = false;
                    break;
                case chs.Button.hover:
                    this.onHover();
                    break;
                case chs.Button.pressed:
                    this.onPressed();
                    break;
                }
            }
        })
    });

}());
