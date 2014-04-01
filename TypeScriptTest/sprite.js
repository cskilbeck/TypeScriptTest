//////////////////////////////////////////////////////////////////////

/*global LinkedList, LinkedListNode, Image */
/*jslint bitwise: true, maxlen: 130 */

//////////////////////////////////////////////////////////////////////

function SpriteList(listNodeName) {
    "use strict";

    LinkedList.call(this, listNodeName || 'spriteListNode');
}

//////////////////////////////////////////////////////////////////////

SpriteList.prototype = Object.create(LinkedList.prototype);

//////////////////////////////////////////////////////////////////////

SpriteList.prototype.draw = function (context) {
    "use strict";
    context.save();
    this.reverseForEach(function (s) {
        s.draw();
    });
    context.restore();
};

//////////////////////////////////////////////////////////////////////

SpriteList.prototype.isLoaded = function () {
    "use strict";
    return this.reverseForEach(function (s) {
        return s.loaded();
    });
};

//////////////////////////////////////////////////////////////////////

SpriteList.prototype.add = LinkedList.prototype.pushFront;
SpriteList.prototype.addToBack = LinkedList.prototype.pushBack;

//////////////////////////////////////////////////////////////////////

var ImageLoader = (function () {
    "use strict";

    var images = {};

    return {

        get: function (name) {
            return images[name];
        },

        load: function (name) {
            var image;
            if (name !== undefined) {
                if (images.hasOwnProperty(name)) {
                    return images[name];
                }
                image = new Image();
                images[name] = image;
                image.src = 'img/' + name + '.png';
                return image;
            }
            return null;
        }
    };
}());

//////////////////////////////////////////////////////////////////////

var Sprite = (function () {
    "use strict";
    var sprite = function (graphic, listNodeName) {
        this.x = 0.0;
        this.y = 0.0;
        this.scaleX = 1.0;
        this.scaleY = 1.0;
        this.rotation = 0.0;
        this.pivotX = 0.5;
        this.pivotY = 0.5;
        this.visible = true;
        this.transparency = 255;
        this.image = graphic;
        this.framesWide = 1;
        this.framesHigh = 1;
        this.frameWidth = 0;
        this.frameHeight = 0;
        this.frame = 0;
        this.flipX = false;
        this.flipY = false;
        this[listNodeName || 'spriteListNode'] = new LinkedListNode(this);
    };

    //////////////////////////////////////////////////////////////////////

    sprite.prototype = {

        //////////////////////////////////////////////////////////////////////

        loaded: function () {
            return this.image !== null && this.image.complete;
        },

        //////////////////////////////////////////////////////////////////////

        width: function () {
            return this.image.width;
        },

        //////////////////////////////////////////////////////////////////////

        height: function () {
            return this.image.height;
        },

        //////////////////////////////////////////////////////////////////////

        draw: function (context) {
            var fw,
                fh,
                frameX,
                frameY,
                xtweak,
                ytweak;
            if (this.loaded() && this.visible) {
                context.setTransform(1, 0, 0, 1, 0, 0);
                context.translate(this.x, this.y);
                context.rotate(this.rotation);
                context.scale(this.scaleX * (this.flipX ? -1 : 1), this.scaleY * (this.flipY ? -1 : 1));
                fw = this.frameWidth === 0 ? this.width() : this.frameWidth;
                fh = this.frameHeight === 0 ? this.height() : this.frameHeight;
                frameX = ((this.frame % this.framesWide) >>> 0) * fw;
                frameY = ((this.frame / this.framesWide) >>> 0) * fh;
                context.globalAlpha = this.transparency / 255;
                xtweak = 0;
                ytweak = 0;
                if (this.scaleX > 1) {
                    xtweak = 0.5 - (0.5 / this.scaleX);
                }
                if (this.scaleY > 1) {
                    ytweak = 0.5 - (0.5 / this.scaleY);
                }
                frameX += xtweak;
                frameY += ytweak;
                context.drawImage(this.image,
                    frameX, frameY,
                    fw - xtweak * 2, fh - ytweak * 2,
                    -this.pivotX * fw, -this.pivotY * fh,
                    fw, fh);
            }
        },

        //////////////////////////////////////////////////////////////////////

        drawSafe: function (context) {
            context.save();
            this.draw(context);
            context.restore();
        }
    };

    //////////////////////////////////////////////////////////////////////

    return sprite;

}());

//////////////////////////////////////////////////////////////////////
