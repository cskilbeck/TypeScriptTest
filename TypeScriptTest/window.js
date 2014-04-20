(function () {
    "use strict";

    chs.Window = chs.Class({ inherits: chs.Panel,

        ctor: function (x, y, w, h, caption, font, cornerRadius, backgroundColour, captionScale) {

            var cr = cornerRadius || 0,
                bgcol = backgroundColour || "black",
                cs = captionScale || 1,
                d = font.height * cs + cr + 2;
            if (d < cr) {
                d = cr;
            }
            chs.Panel.call(this, x, y, w, h, bgcol, undefined, cr, 0);
            this.clip = new chs.ClipRect(0, 0, w, h, cr);
            this.client = new chs.ClipRect(0, d, w, h - d);
            this.caption = new chs.Label(caption, font).setPosition(cr + 8, d / 2).setScale(cs).setPivot(0, font.midPivot);
            this.closeButton = new chs.PanelButton(w - d, 0, d, d, "darkred", "white", 0, 4, function () { this.close(); }, this);
            this.closeButton.onHover = function () { this.fillColour = "firebrick"; };
            this.closeButton.onIdle = function () { this.fillColour = "darkred"; };
            this.closeButton.onPressed = function () { this.fillColour = "red"; };
            this.closeButton.addChild(new chs.Line(d * 0.25, d * 0.25, d * 0.75, d * 0.75, "white", d / 8));
            this.closeButton.addChild(new chs.Line(d * 0.75, d * 0.25, d * 0.25, d * 0.75, "white", d / 8));
            this.titleBar = new chs.Panel(0, 0, w - d, d, "darkslategrey", undefined, 0);
            this.clip.addChild(this.titleBar);
            this.clip.addChild(this.closeButton);
            this.clip.addChild(this.caption);
            this.clip.addChild(this.client);
            this.addChild(this.clip);
            this.addChild(new chs.Line(0, d, 640, d, 'white', 4));
            this.addChild(new chs.Panel(0, 0, 640, 480, undefined, "white", cr, 4));
            this.client.window = this;
            this.drag = false;
            this.dragOffset = { x: 0, y: 0 };
            this.titleBar.window = this;
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
        },

        methods: {

            text: {
                get: function () {
                    return this.caption.text;
                },
                set: function (s) {
                    this.caption.text = s;
                }
            }
        }
    });

}());

