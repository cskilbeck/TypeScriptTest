//////////////////////////////////////////////////////////////////////

var ImageLoader = (function () {
    "use strict";

    var images = {},
        requested = 0,
        loaded = 0;

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
                ++requested;
                image = new Image();
                images[name] = image;
                image.addEventListener("load", function () {
                    ++loaded;
                }, false);
                image.src = 'img/' + name + '.png';
                return image;
            }
            return null;
        },

        complete: function () {
            return requested === loaded;
        },

        loaded: function (name) {
            return images.hasOwnProperty(name) ? images[name].complete : false;
        }
    };
}());

