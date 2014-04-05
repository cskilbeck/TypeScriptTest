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
            var image,
                dataLen,
                binary,
                i;
            if (images.hasOwnProperty(name)) {
                return images[name];
            }
            ++requested;
            image = new Image();
            images[name] = image;
            ajax.get('img/' + name + '.png', {}, function (data) {
                image.src = 'data:image/png;base64,' + Util.btoa(data);
                ++loaded;
            }, null, 'text/plain; charset=x-user-defined');
            return image;
        },

        complete: function () {
            return requested === loaded;
        },

        loaded: function (name) {
            return images.hasOwnProperty(name) ? images[name].complete : false;
        }
    };
}());

