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

        Item = function (url, object) {
            this.url = url;
            this.object = object;
            this.size = undefined;
            this.bytesReceived = 0;
        };

    //////////////////////////////////////////////////////////////////////

    function cache(items, url) {
        if (items.hasOwnProperty(url)) {
            return items[url].object;
        }
        return null;
    }

    //////////////////////////////////////////////////////////////////////

    function progress(url, e) {
        if (e.lengthComputable && this.items[url].size === undefined) {
            this.items[url].size = e.total;
        }
        this.items[url].bytesReceived = e.loaded;
    }

    //////////////////////////////////////////////////////////////////////

    Loader.prototype = {

        //////////////////////////////////////////////////////////////////////

        complete: function () {
            return this.requests === this.loaded;
        },

        //////////////////////////////////////////////////////////////////////

        toString: function () {
            var i,
                s = '';
            for (i in this.items) {
                s += this.items[i].url + "," + this.items[i].size.toString() + "," + this.items[i].bytesReceived.toString() + '\n';
            }
            return s;
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

        loadImage: function (name, callback, context, data) {
            var url = ajax.url('img/' + name + '.png', data || {}),
                image = cache(this.items, url);
            if (image === null) {
                this.items[url] = new Item(url, image);
                image = new Image();
                ++this.requests;
                url = ajax.get(url, function (url, data) {
                    console.log("Got " + url);
                    image.src = 'data:image/png;base64,' + Util.btoa(data);
                    console.log("image is " + image.width + "," + image.height);
                    if (callback !== undefined) {
                        callback.call(context, image);
                    }
                    ++this.loaded;
                }, progress, this, true);
            }
            return image;
        },

        //////////////////////////////////////////////////////////////////////

        loadJSON: function (name, callback, context, data) {
            var url = ajax.url('img/' + name + '.json', data || {}),
                d = cache(this.items, url);
            if (d === null) {
                d = {};
                this.items[url] = new Item(url, d);
                ++this.requests;
                ajax.get(url, function (url, data) {
                    d = JSON.parse(data);
                    if (callback !== undefined) {
                        callback.call(context, d);
                    }
                    ++this.loaded;
                }, progress, this, false);
            }
        }
    };

    return Loader;
}());
