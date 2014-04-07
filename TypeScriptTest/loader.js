//////////////////////////////////////////////////////////////////////

var Loader = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Loader = function () {
            this.items = {};
            this.totalBytes = 0;
            this.bytesReceived = 0;
        },

    //////////////////////////////////////////////////////////////////////

        Item = function (url, object, type, callback, context, data) {
            this.url = url;
            this.object = object;
            this.size = undefined;
            this.bytesReceived = 0;
            this.type = type;
            this.callback = callback;
            this.context = context;
            this.data = data;
            this.loaded = false;
        };

    //////////////////////////////////////////////////////////////////////

    Item.prototype.doCallback = function () {
        if (this.callback != null) {
            this.callback.call(this.context, this.object);
        }
    };

    //////////////////////////////////////////////////////////////////////

    Item.prototype.onComplete = function () {
        this.doCallback();
        this.loaded = true;
    };

    //////////////////////////////////////////////////////////////////////

    function progress(url, e) {
        /*jshint validthis: true */
        if (e.lengthComputable && this.size === undefined) {
            this.size = e.total;
        }
        this.bytesReceived = e.loaded;
    }

    //////////////////////////////////////////////////////////////////////

    function processImage(url, data) {
        /*jshint validthis: true */
        this.object.src = 'data:image/png;base64,' + Util.btoa(data);
        this.onComplete();
    }

    //////////////////////////////////////////////////////////////////////

    function processJSON(url, data) {
        /*jshint validthis: true */
        Util.shallowCopy(JSON.parse(data), this.object);    // fuckit
        this.onComplete();
    }

    //////////////////////////////////////////////////////////////////////

    function cache(items, url) {
        if (items.hasOwnProperty(url)) {
            return items[url].object;
        }
        return null;
    }

    //////////////////////////////////////////////////////////////////////

    Loader.prototype = {

        //////////////////////////////////////////////////////////////////////

        percentComplete: function () {
            var i,
                total = 0,
                received = 0;
            for (i in this.items) {
                if (this.items[i].size !== undefined) {
                    total += this.items[i].size;
                }
                received += this.items[i].bytesReceived;
            }
            total = total || received;
            return received > 0 ? received * 100 / total : 0;
        },

        //////////////////////////////////////////////////////////////////////

        loadingComplete: function () {
            var i;
            for (i in this.items) {
                if (!this.items[i].loaded) {
                    return false;
                }
            }
            return true;
        },

        //////////////////////////////////////////////////////////////////////

        start: function () {
            var i,
                img;
            for (i in this.items) {
                switch (this.items[i].type) {
                case 'png':
                    ajax.get(this.items[i].url, processImage, progress, this.items[i], true);
                    break;

                case 'json':
                    ajax.get(this.items[i].url, processJSON, progress, this.items[i], false);
                    break;
                }
            }
        },

        //////////////////////////////////////////////////////////////////////

        loadImage: function (name, callback, context, data) {
            var url = ajax.url('img/' + name + '.png', data || {}),
                image = cache(this.items, url);
            if (image === null) {
                image = new Image();
                this.items[url] = new Item(url, image, "png", callback, context, data);
            } else {
                this.items[url].doCallback();
            }
            return image;
        },

        //////////////////////////////////////////////////////////////////////

        loadJSON: function (name, callback, context, data) {
            var url = ajax.url('img/' + name + '.json', data || {}),
                obj = cache(this.items, url);
            if (obj === null) {
                obj = {};
                this.items[url] = new Item(url, obj, "json", callback, context, data);
            } else {
                this.items[url].doCallback();
            }
            return obj;
        }
    };

    return Loader;
}());
