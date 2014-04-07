//////////////////////////////////////////////////////////////////////

var Loader = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Loader = function (baseDir) {
            this.baseDir = baseDir;
            this.items = {};
        },

    //////////////////////////////////////////////////////////////////////

        Item = function (url, object, callback, context, data) {
            this.url = url;
            this.object = object;
            this.size = undefined;
            this.bytesReceived = 0;
            this.callback = callback;
            this.context = context;
            this.data = data;
            this.loaded = false;
            this.ext = url.match(/(?:(?:[\w\W]+)\.)([\w\W]+?)(\?|$)/)[1].toLowerCase();
            this.binary = undefined;
            this.started = false;
            switch (this.ext) {
            case 'png':
                this.binary = true;
                this.finalize = Item.processImage;
                break;
            case 'json':
                this.binary = false;
                this.finalize = Item.processJSON;
                break;
            }
        };

    //////////////////////////////////////////////////////////////////////

    Item.prototype.load = function () {
        if (!this.started) {
            this.started = true;
            ajax.get(this.url, Item.onLoaded, Item.onProgress, this, this.binary);
        }
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

    Item.onProgress = function (url, e) {
        if (e.lengthComputable && this.size === undefined) {
            this.size = e.total;
        }
        this.bytesReceived = e.loaded;
    };

    //////////////////////////////////////////////////////////////////////

    Item.onLoaded = function (url, data) {
        this.finalize.call(this, data);
        this.onComplete();
    };

    //////////////////////////////////////////////////////////////////////

    Item.processImage = function (data) {
        this.object.src = 'data:image/png;base64,' + Util.btoa(data);
    };

    //////////////////////////////////////////////////////////////////////

    Item.processJSON = function (data) {
        Util.shallowCopy(JSON.parse(data), this.object);    // fuckit
    };

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
            var i;
            for (i in this.items) {
                this.items[i].load();
            }
        },

        //////////////////////////////////////////////////////////////////////

        loadImage: function (name, callback, context, data) {
            var url = ajax.url(this.baseDir + name + '.png', data),
                image = cache(this.items, url);
            if (image === null) {
                image = new Image();
                this.items[url] = new Item(url, image, callback, context, data);
            } else {
                this.items[url].doCallback();
            }
            return image;
        },

        //////////////////////////////////////////////////////////////////////

        loadJSON: function (name, callback, context, data) {
            var url = ajax.url(this.baseDir + name + '.json', data),
                obj = cache(this.items, url);
            if (obj === null) {
                obj = {};
                this.items[url] = new Item(url, obj, callback, context, data);
            } else {
                this.items[url].doCallback();
            }
            return obj;
        }
    };

    return Loader;
}());
