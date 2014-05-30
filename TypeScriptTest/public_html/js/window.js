(function () {
    "use strict";

    chs.Window = chs.Class({ inherit$: chs.Drawable,

        $: function (desc) {
            var hasCloseButton = (desc.closeButton === undefined) ? false : desc.closeButton,
                isDraggable = (desc.draggable === undefined) ? true : desc.draggable,
                radius = desc.cornerRadius || 0,
                bgcol = desc.backgroundColour || "black",
                captionScale = desc.captionScale || 1,
                captionColour = desc.captionColour !== undefined ? desc.captionColour : 'darkslategrey',
                hasBorder = desc.border === undefined ? true : desc.border,
                borderWidth = desc.borderWidth || 2,
                borderColour = desc.borderColor !== undefined ? desc.borderColor : "white",
                hasTitleBar = desc.caption !== undefined,
                titleBarHeight = Math.max(hasTitleBar ? desc.font.height * captionScale + borderWidth * 4 : 0, radius),
                titleBarWidth = desc.width;

            chs.Drawable.call(this);
            this.size = { width: desc.width, height: desc.height };
            this.setPosition(desc.x, desc.y);

            this.panel = new chs.Panel(0, 0, desc.width, desc.height, bgcol, none, radius, 0);
            this.addChild(this.panel);

            if (hasCloseButton) {
                titleBarWidth -= titleBarHeight;
            }

            this.clientOffset = titleBarHeight;

            this.clip = new chs.ClipRect(0, 0, desc.width, desc.height, radius);
            this.client = new chs.ClipRect(0, this.clientOffset, desc.width, desc.height - this.clientOffset);
            this.clip.addChild(this.client);
            this.addChild(this.clip);
            this.border = null;

            if (hasTitleBar) {
                this.titleBar = new chs.Panel(0, 0, titleBarWidth, titleBarHeight, captionColour, none, 0);
                this.titleBar.window = this;
                this.clip.addChild(this.titleBar);
                this.caption = new chs.Label(desc.caption, desc.font).setPosition(radius + borderWidth + 4, titleBarHeight / 2).setScale(captionScale).setPivot(0, desc.font.midPivot);
                this.titleBar.addChild(this.caption);
                if (hasBorder) {
                    this.addChild(new chs.Line(0, titleBarHeight, desc.width, titleBarHeight, borderColour, borderWidth));
                }
            }

            if (hasCloseButton) {
                this.closeButton = new chs.PanelButton(desc.width - titleBarHeight, 0, titleBarHeight, titleBarHeight, "darkred", none, 0, 0, function () { this.close(); }, this);
                this.closeButton.onHover = function () { this.fillColour = "firebrick"; };
                this.closeButton.onIdle = function () { this.fillColour = "darkred"; };
                this.closeButton.onPressed = function () { this.fillColour = "red"; };
                this.closeButton.addChild(new chs.Line(titleBarHeight * 0.25, titleBarHeight * 0.25, titleBarHeight * 0.75, titleBarHeight * 0.75, "white", titleBarHeight / 8));
                this.closeButton.addChild(new chs.Line(titleBarHeight * 0.75, titleBarHeight * 0.25, titleBarHeight * 0.25, titleBarHeight * 0.75, "white", titleBarHeight / 8));
                this.clip.addChild(this.closeButton);
                this.clip.addChild(new chs.Line(titleBarWidth, 0, titleBarWidth, titleBarHeight, borderColour, borderWidth));
            }

            if (borderColour !== undefined) {
                this.border = new chs.Panel(0, 0, desc.width, desc.height, none, borderColour, radius, borderWidth);
                this.addChild(this.border);
            }
            this.client.window = this;
            this.drag = false;
            this.dragOffset = { x: 0, y: 0 };
            this.dragStart = { x: 0, y: 0 };

            if (hasTitleBar && isDraggable) {

                this.titleBar.addEventHandler("leftMouseDown", function (e) {
                    this.drag = true;
                    this.titleBar.setCapture(true);
                    this.dragStart = e.position;
                    this.dragOffset = { x: this.position.x - e.position.x, y: this.position.y - e.position.y };   // screen coordinate!
                }, this);

                this.titleBar.addEventHandler("leftMouseUp", function (e) {
                    this.titleBar.setCapture(false);
                    this.drag = false;
                }, this);

                this.titleBar.addEventHandler("mouseMove", function (e) {
                    var pos,
                        x,
                        y,
                        w,
                        h;
                    if (this.drag) {
                        x = e.position.x + this.dragOffset.x;   // WINDOW DRAG CONTRAINT BROKEN IF TRANSFORM IS MORE THAN SIMPLE TRANSLATION!!!
                        y = e.position.y + this.dragOffset.y;
                        x = chs.Util.constrain(x, -this.width / 4, chs.desktop.width + this.width / 4);
                        y = chs.Util.constrain(y, this.height / 2, chs.desktop.height + this.height / 2 - this.clientOffset);
                        this.setPosition(x, y);
                    }
                }, this);
            }

            if(desc.backgroundTransparency !== undefined) {
                this.panel.transparency = desc.backgroundTransparency;
            }

            if (desc.modal !== undefined) {
                this.modal = desc.modal;
            }
        },

        height: chs.Property({
            get: function () {
                return this.drawableData.dimensions.height;
            },
            set: function (h) {
                this.drawableData.dimensions.height = h;
                this.panel.height = h;
                this.clip.height = h;
                this.client.height = h - this.clientOffset;
                if (this.border) {
                    this.border.height = h;
                }
                this.dispatchEvent('resize');
            }
        }),

        width: chs.Property({
            get: function () {
                return this.drawableData.dimensions.width;
            },
            set: function (w) {
                this.drawableData.dimensions.width = w;
                this.panel.width = w;
                this.clip.width = w;
                this.client.width = w;
                if (this.border) {
                    this.border.width = w;
                }
                this.dispatchEvent('resize');
            }
        }),

        text: chs.Property({
            get: function () {
                return this.caption.text;
            },
            set: function (s) {
                this.caption.text = s;
            }
        })
    });

}());

