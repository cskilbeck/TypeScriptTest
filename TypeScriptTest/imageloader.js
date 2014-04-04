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

