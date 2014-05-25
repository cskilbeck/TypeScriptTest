//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    chs.Button = chs.Class({ inherit$: [chs.EventSource],

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

        onClicked: function () {
        },

        onTouchStart: function () {
            this.state = chs.Button.pressed;
            return true;
        },

        onTouchEnd: function (e) {
            if(this.state === chs.Button.pressed) {
                this.state = chs.Button.idle;
                this.dispatchEvent("clicked", this);
                if (this.callback) {
                    this.callback.call(this.context || this);
                }
            }
            return true;
        },

        onTouchEnter: function () {
            return true;
        },

        onTouchLeave: function () {
            this.state = chs.Button.idle;
            return true;
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
                this.onClicked();
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
                if(this.currentState != s) {
                    this.currentState = s;
                    switch (s) {
                    case chs.Button.idle:
                        this.dispatchEvent("idle");
                        this.onIdle();
                        break;
                    case chs.Button.hover:
                        this.dispatchEvent("hover");
                        this.onHover();
                        break;
                    case chs.Button.pressed:
                        this.dispatchEvent("pressed");
                        this.onPressed();
                        break;
                    }
                }
            }
        })
    });

}());
