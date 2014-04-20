//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Item = function (url, callback, context, data, loader) {
        this.url = url;
        this.size = null;
        this.bytesReceived = 0;
        this.callback = callback;
        this.context = context;
        this.data = data;
        this.loaded = false;
        this.loader = loader;
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

    Item.prototype = {

        load: function () {
            if (!this.started) {
                this.started = true;
                chs.ajax.get(this.url, Item.onLoaded, Item.onProgress, this, this.binary);
            }
        },
        doCallback: function () {
            if (this.callback != null) {
                this.callback.call(this.context, this.object);
            }
        },
        onComplete: function () {
            this.inProgress = true;
            this.doCallback();          // need a chain of callback for everyone who was interested in this getting loaded...
            this.loaded = true;
            this.loader.itemLoaded(this);
        }
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

    chs.Loader = chs.Class({

        inherits: chs.Drawable,

        //////////////////////////////////////////////////////////////////////

        ctor: function (baseDir) {
            chs.Drawable.call(this);
            this.baseDir = baseDir;
            this.items = {};
            this.context = null;
            this.callback = null;
        },

        //////////////////////////////////////////////////////////////////////

        methods: {

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
            // use debug output for now...

            onUpdate: function () {
                var i,
                    item,
                    s;
                chs.Debug.print("Loading, " + this.percentComplete().toFixed(2) + "% complete...");
                chs.Debug.print();
                for (i in this.items) {
                    item = this.items[i];
                    s = item.bytesReceived.toString();
                    while (s.length < 20) {
                        s = " " + s;
                    }
                    chs.Debug.print(s + ": " + item.url);
                }
            },

            //////////////////////////////////////////////////////////////////////

            start: function (callback, context) {
                var i;
                for (i in this.items) {
                    this.items[i].load();
                }
                this.callback = callback;
                this.context = context;
            },

            //////////////////////////////////////////////////////////////////////

            itemLoaded: function (item) {
                if (this.complete()) {
                    if (this.parent !== null) {
                        this.parent.loaded(this);
                    }
                    if (this.callback !== null) {
                        this.callback.call(this.context, this);
                    }
                }
            },

            //////////////////////////////////////////////////////////////////////

            load: function (name, callback, context, data) {
                var url = chs.ajax.url(this.baseDir + name, data),
                    item = this.items[url] || null;
                if (item !== null) {
                    item.doCallback();
                } else {
                    item = new Item(url, callback, context, data, this);
                    this.items[url] = item;
                }
                return item.object;
            }
        }
    });

}());
