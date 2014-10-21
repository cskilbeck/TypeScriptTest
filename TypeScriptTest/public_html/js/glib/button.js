//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    glib.Button = glib.Class({ inherit$: glib.EventSource,

        static$: {
            idle: 0,
            hover: 1,
            pressed: 2
        },

        $: function (click, context) {
            this.currentState = glib.Button.idle;
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
            this.state = glib.Button.pressed;
            return true;
        },

        onTouchEnd: function (e) {
            if(this.state === glib.Button.pressed) {
                this.state = glib.Button.idle;
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
            this.state = glib.Button.idle;
            return true;
        },

        onMouseEnter: function () {
            this.state = glib.Button.hover;
            return true;
        },

        onMouseLeave: function () {
            this.state = glib.Button.idle;
            return true;
        },

        onLeftMouseDown: function () {
            this.state = glib.Button.pressed;
            return true;
        },

        onLeftMouseUp: function () {
            if (this.state === glib.Button.pressed) {
                this.state = glib.Button.hover;
                this.onClicked();
                this.dispatchEvent("clicked");
                if (this.callback) {
                    this.callback.call(this.context || this);
                }
            }
            return true;
        },

        state: glib.Property({
            get: function () {
                return this.currentState;
            },
            set: function (s) {
                if(this.currentState != s) {
                    this.currentState = s;
                    switch (s) {
                    case glib.Button.idle:
                        this.dispatchEvent("idle");
                        this.onIdle();
                        break;
                    case glib.Button.hover:
                        this.dispatchEvent("hover");
                        this.onHover();
                        break;
                    case glib.Button.pressed:
                        this.dispatchEvent("pressed");
                        this.onPressed();
                        break;
                    }
                }
            }
        })
    });

}());
