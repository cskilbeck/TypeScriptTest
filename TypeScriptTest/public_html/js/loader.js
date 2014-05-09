//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Item = chs.Class({
        inherit$: [chs.EventSource],

        $: function (url, data, loader, forceFileType) {
            var extension;
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
            if (forceFileType === undefined) {
                extension = chs.Util.getExtension(url);
            } else {
                extension = forceFileType;
            }
            switch (extension) {
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

        then: function (c, f) {
            if (this.loaded) {
                f.call(c, this.object);
            } else {
                this.addEventHandler("loaded", f, c, true);
            }
        },

        static$: {

            onProgress: function (url, e) {
                this.inProgress = true;
                if (e.lengthComputable && this.size === null) {
                    this.size = e.total;
                }
                this.bytesReceived = e.loaded;
            },

            onLoaded: function (url, xr) {
                var data = null,
                    process = null,
                    contentType = xr.getResponseHeader('Content-Type');
                switch(contentType) {
                    case 'image/png':
                        data = chs.Util.getResponseAsArray(xr);
                        process = Item.processImage;
                        break;
                    case 'image/jpeg':
                        data = chs.Util.getResponseAsArray(xr);
                        process = Item.processJPEG;
                        break;
                    case 'application/json':
                        data = xr.responseText;
                        process = Item.processJSON;
                        break;
                    default:
                        console.log("Unknown Content-Type: " + contentType);
                        data = xr.responseText;
                        process = Item.processText;
                        break;
                }
                if(process !== null && data !== null) {
                    process.call(this, data);
                }
                this.inProgress = true;
                this.loaded = true;
                this.doCallback();
            },

            processImage: function (data) {
                if (data) {
                    this.object.src = 'data:image/png;base64,' + chs.Util.btoa(data);
                } else {
                    this.object.src = 'http://www.underconsideration.com/brandnew/archives/google_broken_image_00_a_logo.gif';
                }
            },

            processJPEG: function (data) {
                if (data) {
                    this.object.src = 'data:image/jpeg;base64,' + chs.Util.btoa(data);
                } else {
                    this.object.src = 'http://www.underconsideration.com/brandnew/archives/google_broken_image_00_a_logo.gif';
                }
            },

            processJSON: function (data) {
                if (data) {
                    chs.Util.shallowCopy(JSON.parse(data), this.object);    // fuckit
                } else {
                }
            },

            processText: function (data) {
            },

            processBinary: function (data) {
                if (data) {
                    this.object.set(data, 0);
                }
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
            this.baseDir = baseDir || "";
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

        loadItem: function (name, callback, context, data) {
            var url = chs.ajax.url(this.baseDir + name, data),
                item = this.items[url] || null;
            if (item === null) {
                item = new Item(url, data, this);
                this.items[url] = item;
            }
            item.load();
            return item;
        },

        //////////////////////////////////////////////////////////////////////

        load: function (name, callback, context, data, forceFileType) {
            var url = chs.ajax.url(this.baseDir + name, data),
                item = this.items[url] || null;
            if (item === null) {
                item = new Item(url, data, this, forceFileType);
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
