(function () {
    "use strict";

    chs.Window = chs.Class({ inherits: chs.Panel,

        $: function (x, y, w, h, caption, font, cornerRadius, backgroundColour, captionScale, closeButton, draggable, borderColour, borderWidth) {
            var cb = (closeButton === undefined) ? true : closeButton,
                dr = (draggable === undefined) ? true : draggable,
                cr = cornerRadius || 0,
                bgcol = backgroundColour || "black",
                cs = captionScale || 1,
                d = font.height * cs + cr + 2,
                clientOffset,
                titleBarWidth = w;
            if (d < cr) {
                d = cr;
            }
            if (cb) {
                titleBarWidth -= d;
            }
            clientOffset = caption ? d : 0;
            chs.Panel.call(this, x, y, w, h, bgcol, undefined, cr, 0);
            this.clip = new chs.ClipRect(0, 0, w, h, cr);
            this.client = new chs.ClipRect(0, clientOffset, w, h - clientOffset);
            this.clip.addChild(this.client);
            this.addChild(this.clip);
            if (caption) {
                this.titleBar = new chs.Panel(0, 0, titleBarWidth, d, "darkslategrey", undefined, 0);
                this.clip.addChild(this.titleBar);
                this.caption = new chs.Label(caption, font).setPosition(cr + 8, d / 2).setScale(cs).setPivot(0, font.midPivot);
                this.titleBar.addChild(this.caption);
                if (borderColour !== undefined) {
                    this.addChild(new chs.Line(0, d + borderWidth, w, d, borderColour, borderWidth));
                }
            }
            if (cb) {
                this.closeButton = new chs.PanelButton(w - d, 0, d, d, "darkred", undefined, 0, 0, function () { this.close(); }, this);
                this.closeButton.onHover = function () { this.fillColour = "firebrick"; };
                this.closeButton.onIdle = function () { this.fillColour = "darkred"; };
                this.closeButton.onPressed = function () { this.fillColour = "red"; };
                this.closeButton.addChild(new chs.Line(d * 0.25, d * 0.25, d * 0.75, d * 0.75, "white", d / 8));
                this.closeButton.addChild(new chs.Line(d * 0.75, d * 0.25, d * 0.25, d * 0.75, "white", d / 8));
                this.clip.addChild(this.closeButton);
                this.clip.addChild(new chs.Line(titleBarWidth, 0, titleBarWidth, d, borderColour, borderWidth));
            }
            if (borderColour !== undefined) {
                this.addChild(new chs.Panel(0, 0, w, h, undefined, borderColour, cr, borderWidth));
            }
            this.client.window = this;
            this.drag = false;
            this.dragOffset = { x: 0, y: 0 };
            if (caption) {
                this.titleBar.window = this;
                if (dr) {
                    this.titleBar.onLeftMouseDown = function (e) {
                        this.drag = true;
                        this.setCapture(true);
                        this.dragOffset = { x: this.window.position.x - e.position.x, y: this.window.position.y - e.position.y };   // screen coordinate!
                        return true;
                    };
                    this.titleBar.onLeftMouseUp = function (e) {
                        this.setCapture(false);
                        this.drag = false;
                        return true;
                    };
                    this.titleBar.onMouseMove = function (e) {
                        var w,
                            h;
                        if (this.drag) {
                            this.window.setPosition(e.position.x + this.dragOffset.x, e.position.y + this.dragOffset.y);
                        }
                        return true;
                    };
                }
            }
        },

        text: {
            get: function () {
                return this.caption.text;
            },
            set: function (s) {
                this.caption.text = s;
            }
        }
    });

}());

