//////////////////////////////////////////////////////////////////////

chs.Loader = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Loader = function (baseDir) {
            this.baseDir = baseDir;
            this.items = {};
            this.context = null;
            this.completion = null;
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
            switch (chs.Util.getExtension(url)) {
            case 'jpg':
            case 'jpeg':
                this.object = new Image();
                this.binary = true;
                this.finalize = Item.processJPEG;
                break;
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
            case 'txt':
            case 'text':
                this.object = "";       // this doesn't work because strings are immutable
                this.binary = false;
                this.finalize = Item.processString;
                break;
            default:
                this.object = new Uint8Array();
                this.binary = true;
                this.finalize = Item.processBinary;
                break;
            }
        };

    //////////////////////////////////////////////////////////////////////

    Item.prototype.load = function () {
        if (!this.started) {
            this.started = true;
            chs.ajax.get(this.url, Item.onLoaded, Item.onProgress, this, this.binary);
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
        this.object.src = 'data:image/png;base64,' + chs.Util.btoa(data);
    };

    //////////////////////////////////////////////////////////////////////

    Item.processJPEG = function (data) {
        this.object.src = 'data:image/jpeg;base64,' + chs.Util.btoa(data);
    };

    //////////////////////////////////////////////////////////////////////

    Item.processJSON = function (data) {
        chs.Util.shallowCopy(JSON.parse(data), this.object);    // fuckit
    };

    //////////////////////////////////////////////////////////////////////

    Item.processString = function (data) {
        this.object += data;
    };

    //////////////////////////////////////////////////////////////////////

    Item.processBinary = function (data) {
        this.object.setArray(data);
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
            return (received > 0) ? received * 100 / total : 0;
        },

        //////////////////////////////////////////////////////////////////////

        complete: function () {
            var i;
            for (i in this.items) {
                if (!this.items[i].loaded) {
                    return false;
                }
            }
            return true;
        },

        //////////////////////////////////////////////////////////////////////

        doLoad: function () {
            var i,
                x = 50,
                y = 50,
                yy,
                item,
                recvd,
                total,
                percent,
                context = this.context;
            if (!this.complete()) {
                context.setTransform(1, 0, 0, 1, 0, 0);
                context.globalCompositeOperation = 'copy';
                context.fillStyle = 'darkgrey';
                context.fillRect(0, 0, context.canvas.width, context.canvas.height);
                context.globalCompositeOperation = 'source-over';
                context.globalAlpha = 1;
                context.strokeStyle = 'white';
                context.fillStyle = 'white';
                context.lineWidth = 1;
                context.font = "20px Arial";
                context.fontBaseLine = 'top';
                context.fillText("Loading... " + this.percentComplete().toFixed(2) + "%", x, y);
                context.fillStyle = 'orange';
                context.strokeRect(x, y + 25, 400, 20);
                context.fillRect(x, y + 26, this.percentComplete() * 3.98, 18);
                context.font = '15px Arial';
                context.fontBaseLine = 'middle';
                yy = y + 50;
                for (i in this.items) {
                    item = this.items[i];
                    if (!item.loaded) {
                        recvd = item.bytesReceived;
                        total = item.size || recvd;
                        percent = recvd * 100 / total;
                        context.strokeRect(x, yy, 102, 22);
                        context.fillStyle = 'white';
                        context.fillRect(x + 1, yy + 1, percent, 20);
                        context.fillStyle = item.inProgress ? 'white' : 'black';
                        context.fillText(item.url + " : " + recvd.toString() + " of " + total.toString(), x + 110, yy + 12);
                        yy += 25;
                    }
                }
                requestAnimFrame(this.doLoad.bind(this));
            } else {
                this.completion.call();
            }
        },

        //////////////////////////////////////////////////////////////////////

        start: function (context, complete) {
            var i;
            for (i in this.items) {
                this.items[i].load();
            }
            this.context = context;
            this.completion = complete;
            this.doLoad();
        },

        //////////////////////////////////////////////////////////////////////

        load: function (name, callback, context, data) {
            var url = chs.ajax.url(this.baseDir + name, data),
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
