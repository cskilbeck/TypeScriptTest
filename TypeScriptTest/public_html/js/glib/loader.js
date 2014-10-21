//////////////////////////////////////////////////////////////////////
// BUG: when loading the same file twice from 2 different calls, loader "complete" callback called multiple times

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Cache = glib.Class({

            static$: {

                items: {},

                get: function(name) {
                    // console.log("Got " + name + "? " + (Cache.items[name] === undefined ? "no" : "yes"));
                    if (Cache.items[name] !== undefined) {
                        return Cache.items[name].object;
                    }
                    return undefined;
                },

                put: function(name, object, size) {
                    // console.log("Adding " + name);
                    Cache.items[name] = { object: object, size: size };
                },

                dump: function() {
                    var i;
                    console.log("{");
                    for(i in Cache.items) {
                        console.log("\t\"" + i + "\": " + Cache.items[i].size.toString() + ",");
                    }
                    console.log("}");
                }
            }
        }),

    //////////////////////////////////////////////////////////////////////

        brokenImageGif = "R0lGODlhHAAeAKIAAMDAwICAgKyomfHv4v8AAAAAAP///wAAACH5BAAAAAAALAAAAAAcAB4AA" +
                            "AOAKLrc7kOYSau9NuLNp+5g9YXhSHbmuaVG4L4wfLEBCBSzZNXdnV88ji+jqwQ3Q1GREiQQJs5" +
                            "JkkKrOKNSHBFowWZ/O+uVMvUsJ82nAVs2VHtaJRcONtri1HPrXmcC/oCBf3hmFwWHiImJfSoYL" +
                            "I1ykCt6koWVjJduA5ucnZ6foAkAOw==",

        Item = glib.Class({ inherit$: glib.EventSource,

            $: function (url, data, loader, forceFileType) {
                var extension;
                glib.EventSource.call(this);
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
                    extension = glib.Util.getExtension(url);
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
                var e;
                if (!this.started) {
                    this.started = true;
                    e = Cache.get(this.url);
                    if(e !== undefined) {
                        this.inProgress = true;
                        this.loaded = true;
                        this.object = e;
                        this.doCallback();
                    } else {
                        glib.ajax.get(this.url, Item.onLoaded, Item.onProgress, this, this.binary);
                    }
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
                        status = xr.status,
                        contentType = xr.getResponseHeader('Content-Type');
                    if(status == 200) {
                        switch(contentType) {
                            case 'image/png':
                                data = glib.Util.getResponseAsArray(xr);
                                process = Item.processImage;
                                break;
                            case 'image/jpeg':
                                data = glib.Util.getResponseAsArray(xr);
                                process = Item.processJPEG;
                                break;
                            case 'text/plain':
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
                    } else {
                        // some error...
                        // check extension of url and maybe give them something
                    }
                    if(process !== null && data !== null) {
                        process.call(this, data);
                        Cache.put(this.url, this.object, data.length);
                    }
                    this.inProgress = true;
                    this.loaded = true;
                    this.doCallback();
                },

                processImage: function (data) {
                    if (data) {
                        this.object.src = 'data:image/png;base64,' + glib.Util.btoa(data);
                    } else {
                        this.object.src = 'data:image/gif;base64,' + brokenImageGif;
                    }
                },

                processJPEG: function (data) {
                    if (data) {
                        this.object.src = 'data:image/jpeg;base64,' + glib.Util.btoa(data);
                    } else {
                        this.object.src = 'data:image/gif;base64,' + brokenImageGif;
                    }
                },

                processJSON: function (data) {
                    var o;
                    if (data) {
                        try {
                            o = JSON.parse(data);
                            glib.Util.shallowCopy(o, this.object);    // fuckit
                        } catch(e) {
                            // almost certainly an error in the data
                        }
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

    glib.Loader = glib.Class({ inherit$: [glib.Drawable, glib.EventSource],

        //////////////////////////////////////////////////////////////////////

        static$: {

            dumpCacheManifest: function () {
                Cache.dump();
            }
        },

        $: function (baseDir) {
            glib.Drawable.call(this);
            glib.EventSource.call(this);
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
            glib.Debug.print("Loading, " + this.percentComplete().toFixed(0) + "% complete...");
            glib.Debug.print();
            for (i in this.items) {
                item = this.items[i];
                s = item.bytesReceived.toString();
                while (s.length < 20) {
                    s = " " + s;
                }
                glib.Debug.print(s + ": " + item.url);
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
            var url = glib.ajax.url(this.baseDir + name, data),
                item = this.items[url];
            if (item === undefined) {
                item = new Item(url, data, this);
                this.items[url] = item;
            }
            item.load();
            return item;
        },

        //////////////////////////////////////////////////////////////////////

        load: function (name, callback, context, data, forceFileType) {
            var url = glib.ajax.url(this.baseDir + name, data),
                item = this.items[url];
            if (item === undefined) {
                item = new Item(url, data, this, forceFileType);
                this.items[url] = item;
            }
            if (callback) {
                item.addEventHandler("loaded", callback, context);
            }
            item.addEventHandler("loaded", this.itemLoaded, this);
            return item.object;
        },

    });

}());
