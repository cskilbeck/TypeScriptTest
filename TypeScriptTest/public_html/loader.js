//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Item = chs.Class({
        inherit$: [chs.EventSource],
        
        $: function (url, data, loader) {
            chs.EventSource.call(this);
            this.url = url;
            this.size = null;
            this.bytesReceived = 0;
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
            //case xml:
            //case bin:
            default:
                this.object = new Uint8Array();
                this.binary = true;
                this.finalize = Item.processBinary;
                break;
            }
        },

        load: function () {
            if (!this.started) {
                this.started = true;
                chs.ajax.get(this.url, Item.onLoaded, Item.onProgress, this, this.binary);
            }
        },

        doCallback: function () {
            this.dispatchEvent("loaded", this.object);
        },

        static$: {

            onProgress: function (url, e) {
                this.inProgress = true;
                if (e.lengthComputable && this.size === null) {
                    this.size = e.total;
                }
                this.bytesReceived = e.loaded;
            },

            onLoaded: function (url, data) {
                this.finalize.call(this, data);
                this.inProgress = true;
                this.loaded = true;
                this.doCallback();
            },

            processImage: function (data) {
                this.object.src = 'data:image/png;base64,' + chs.Util.btoa(data);
            },

            processJPEG: function (data) {
                this.object.src = 'data:image/jpeg;base64,' + chs.Util.btoa(data);
            },

            processJSON: function (data) {
                chs.Util.shallowCopy(JSON.parse(data), this.object);    // fuckit
            },

            processBinary: function (data) {
                this.object.setArray(data);
            }
        }
    });

    //////////////////////////////////////////////////////////////////////

    chs.Loader = chs.Class({
        inherit$: [chs.Drawable, chs.EventSource],

        //////////////////////////////////////////////////////////////////////

        $: function (baseDir) {
            chs.Drawable.call(this);
            chs.EventSource.call(this);
            this.baseDir = baseDir;
            this.items = {};
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
            chs.Debug.print("Loading, " + this.percentComplete().toFixed(0) + "% complete...");
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

        reset: function (baseDir) {
            this.baseDir = baseDir || this.baseDir;
            this.items = {};
        },

        //////////////////////////////////////////////////////////////////////

        start: function () {
            var i;
            for (i in this.items) {
                this.items[i].load();
            }
        },

        //////////////////////////////////////////////////////////////////////

        itemLoaded: function (item) {
            if (this.complete()) {
                if (this.parent !== null) {
                    this.parent.loaded(this);
                }
                this.dispatchEvent("complete");
            }
        },

        //////////////////////////////////////////////////////////////////////

        load: function (name, callback, context, data) {
            var url = chs.ajax.url(this.baseDir + name, data),
                item = this.items[url] || null;
            if (item === null) {
                item = new Item(url, data, this);
                this.items[url] = item;
            }
            if (item.loaded) {
                if (callback) {
                    callback.call(context, item.object);
                }
            } else {
                if (callback) {
                    item.addEventHandler("loaded", callback, context);
                }
                item.addEventHandler("loaded", this.itemLoaded, this);
            }
            return item.object;
        }
    });

}());
