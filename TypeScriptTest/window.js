(function () {
    "use strict";

    chs.Window = chs.Class({ inherits: chs.Panel,

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
                titleBarHeight = hasTitleBar ? desc.font.height * captionScale + borderWidth * 4 : 0,
                clientOffset,
                titleBarWidth = desc.width;

            if (titleBarHeight < radius) {
                titleBarHeight = radius;
            }

            if (hasCloseButton) {
                titleBarWidth -= titleBarHeight;
            }

            clientOffset = titleBarHeight;

            chs.Panel.call(this, desc.x, desc.y, desc.width, desc.height, bgcol, undefined, radius, 0);

            this.clip = new chs.ClipRect(0, 0, desc.width, desc.height, radius);
            this.client = new chs.ClipRect(0, clientOffset, desc.width, desc.height - clientOffset);
            this.clip.addChild(this.client);
            this.addChild(this.clip);

            if (hasTitleBar) {
                this.titleBar = new chs.Panel(0, 0, titleBarWidth, titleBarHeight, captionColour, undefined, 0);
                this.titleBar.window = this;
                this.clip.addChild(this.titleBar);
                this.caption = new chs.Label(desc.caption, desc.font).setPosition(radius + borderWidth + 4, titleBarHeight / 2).setScale(captionScale).setPivot(0, desc.font.midPivot);
                this.titleBar.addChild(this.caption);
                if (hasBorder) {
                    this.addChild(new chs.Line(0, titleBarHeight, desc.width, titleBarHeight, borderColour, borderWidth));
                }
            }

            if (hasCloseButton) {
                this.closeButton = new chs.PanelButton(desc.width - titleBarHeight, 0, titleBarHeight, titleBarHeight, "darkred", undefined, 0, 0, function () { this.close(); }, this);
                this.closeButton.onHover = function () { this.fillColour = "firebrick"; };
                this.closeButton.onIdle = function () { this.fillColour = "darkred"; };
                this.closeButton.onPressed = function () { this.fillColour = "red"; };
                this.closeButton.addChild(new chs.Line(titleBarHeight * 0.25, titleBarHeight * 0.25, titleBarHeight * 0.75, titleBarHeight * 0.75, "white", titleBarHeight / 8));
                this.closeButton.addChild(new chs.Line(titleBarHeight * 0.75, titleBarHeight * 0.25, titleBarHeight * 0.25, titleBarHeight * 0.75, "white", titleBarHeight / 8));
                this.clip.addChild(this.closeButton);
                this.clip.addChild(new chs.Line(titleBarWidth, 0, titleBarWidth, titleBarHeight, borderColour, borderWidth));
            }

            if (borderColour !== undefined) {
                this.addChild(new chs.Panel(0, 0, desc.width, desc.height, undefined, borderColour, radius, borderWidth));
            }
            this.client.window = this;
            this.drag = false;
            this.dragOffset = { x: 0, y: 0 };

            if (hasTitleBar && isDraggable) {
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

            if (desc.transparency !== undefined) {
                this.transparency = desc.transparency;
            }

            if (desc.modal !== undefined) {
                this.modal = desc.modal;
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

