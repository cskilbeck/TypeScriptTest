//////////////////////////////////////////////////////////////////////

var Loader = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Loader = function (baseDir) {
            this.baseDir = baseDir;
            this.items = {};
        },

    //////////////////////////////////////////////////////////////////////

        Item = function (url, callback, context, data) {
            this.url = url;
            this.size = null;
            this.bytesReceived = 0;
            this.callback = callback;
            this.context = context;
            this.data = data;
            this.loaded = false;
            this.inProgress = false;
            this.binary = undefined;
            this.started = false;
            switch (Util.getExtension(url)) {
            case 'png':
                this.object = new Image();
                this.binary = true;
                this.finalize = Item.processImage;
                break;
            case 'json':
                this.object = {};
                this.binary = false;
                this.finalize = Item.processJSON;
                break;
            default:
                this.item = { text: "" };
                this.binary = false;
                this.finalize = Item.procesString;
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
        this.inProgress = true;
        this.doCallback();
        this.loaded = true;
    };

    //////////////////////////////////////////////////////////////////////

    Item.onProgress = function (url, e) {
        this.inProgress = true;
        if (e.lengthComputable && this.size === null) {
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

    Item.processString = function (data) {
        this.object.text = data;
    };

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

        status: function (ctx, x, y) {
            var i,
                item,
                recvd,
                total,
                percent;
            ctx.resetTransform();
            ctx.strokeStyle = 'white';
            ctx.font = '15px Arial';
            ctx.lineWidth = 1;
            ctx.textBaseline = 'middle';
            for (i in this.items) {
                item = this.items[i];
                if (!item.loaded) {
                    recvd = item.bytesReceived;
                    total = item.size || recvd;
                    percent = recvd * 100 / total;
                    ctx.strokeRect(x, y, 102, 22);
                    ctx.fillStyle = 'white';
                    ctx.fillRect(x + 1, y + 1, percent, 20);
                    ctx.fillStyle = item.inProgress ? 'white' : 'black';
                    ctx.fillText(item.url + " : " + recvd.toString() + " of " + total.toString(), x + 110, y + 10);
                    y += 25;
                }
            }
        },

        //////////////////////////////////////////////////////////////////////

        start: function () {
            var i;
            for (i in this.items) {
                this.items[i].load();
            }
        },

        //////////////////////////////////////////////////////////////////////

        load: function (name, callback, context, data) {
            var url = ajax.url(this.baseDir + name, data),
                item = this.items[url] || null;
            if (item !== null) {
                item.doCallback();
            } else {
                item = new Item(url, callback, context, data);
                this.items[url] = item;
            }
            return item.object;
        }
    };

    return Loader;
}());
