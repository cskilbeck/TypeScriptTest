//////////////////////////////////////////////////////////////////////

var Loader = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Loader = function () {
            this.items = {};
            this.requests = 0;
            this.loaded = 0;
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
        console.log("Got " + url);
        console.log("image is " + this.object.width + "," + this.object.height);
        this.doCallback();
        this.loaded = true;
    }

    //////////////////////////////////////////////////////////////////////

    function processJSON(url, data) {
        /*jshint validthis: true */
        Util.shallowCopy(JSON.parse(data), this.object);    // fuckit
        this.doCallback();
        this.loaded = true;
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

        complete: function () {
            return this.requests === this.loaded;
        },

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
            console.log("Loader.start<<");
            for (i in this.items) {
                console.log("Kick " + this.items[i].url);
                switch (this.items[i].type) {
                case 'png':
                    ajax.get(this.items[i].url, processImage, progress, this.items[i], true);
                    break;

                case 'json':
                    ajax.get(this.items[i].url, processJSON, progress, this.items[i], false);
                    break;
                }
            }
            console.log(">>end of Loader.start");
        },

        //////////////////////////////////////////////////////////////////////

        loadImage: function (name, callback, context, data) {
            var url = ajax.url('img/' + name + '.png', data || {}),
                image = cache(this.items, url);
            if (image === null) {
                image = new Image();
                this.items[url] = new Item(url, image, "png", callback, context, data);
                ++this.requests;
            } else {
                this.items[url].doCallback();
            }
            return image;
        },

        //////////////////////////////////////////////////////////////////////

        loadJSON: function (name, callback, context, data) {
            var url = ajax.url('img/' + name + '.json', data || {}),
                d = cache(this.items, url);
            if (d === null) {
                d = {};
                this.items[url] = new Item(url, d, "json", callback, context, data);
                ++this.requests;
            } else {
                this.items[url].doCallback();
            }
            return d;
        }
    };

    return Loader;
}());
