//////////////////////////////////////////////////////////////////////

chs.Button = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    function Button(click, context) {
        this.currentState = Button.idle;
        this.callback = click;
        this.context = context || this;
    }

    //////////////////////////////////////////////////////////////////////

    Button.idle = 0;
    Button.hover = 1;
    Button.pressed = 2;

    //////////////////////////////////////////////////////////////////////

    return chs.override(Button, {

        onHover: function () {
        },

        onIdle: function () {
        },

        onPressed: function () {
        },

        onMouseEnter: function () {
            this.state = Button.hover;
            return true;
        },

        onMouseLeave: function () {
            this.state = Button.idle;
            return true;
        },

        onLeftMouseDown: function () {
            this.state = Button.pressed;
            return true;
        },

        onLeftMouseUp: function () {
            if (this.state === Button.pressed) {
                this.state = Button.hover;
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
                case Button.idle:
                    this.onIdle();
                    this.drawableData.mouseIsOver = false;
                    break;
                case Button.hover:
                    this.onHover();
                    break;
                case Button.pressed:
                    this.onPressed();
                    break;
                }
            }
        }
    });

}());
