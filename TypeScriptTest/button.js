//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    chs.Button = chs.Class({

        statics: {
            idle: 0,
            hover: 1,
            pressed: 2
        },

        ctor: function (click, context) {
            this.currentState = chs.Button.idle;
            this.callback = click;
            this.context = context || this;
        },

        methods: {

            onHover: function () {
            },

            onIdle: function () {
            },

            onPressed: function () {
            },

            onMouseEnter: function () {
                this.state = chs.Button.hover;
                return true;
            },

            onMouseLeave: function () {
                this.state = chs.Button.idle;
                return true;
            },

            onLeftMouseDown: function () {
                this.state = chs.Button.pressed;
                return true;
            },

            onLeftMouseUp: function () {
                if (this.state === chs.Button.pressed) {
                    this.state = chs.Button.hover;
                    if (this.callback !== undefined) {
                        this.callback.call(this.context || this);
                    }
                }
                return true;
            },

            state: {
                get: function () {
                    return this.currentState;
                },
                set: function (s) {
                    this.currentState = s;
                    switch (s) {
                    case chs.Button.idle:
                        this.onIdle();
                        this.drawableData.mouseIsOver = false;
                        break;
                    case chs.Button.hover:
                        this.onHover();
                        break;
                    case chs.Button.pressed:
                        this.onPressed();
                        break;
                    }
                }
            }
        }
    });

}());
