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
	};

	//////////////////////////////////////////////////////////////////////

	Loader.prototype = {

		//////////////////////////////////////////////////////////////////////

		complete: function () {
			return this.requests === this.loaded;
		},

		//////////////////////////////////////////////////////////////////////

		status: function () {
			return this.loaded.toString() + "/" + this.requests.toString() + ":";
		},

		//////////////////////////////////////////////////////////////////////

		cache: function (name) {
			if (this.items.hasOwnProperty(name)) {
				return this.items[name];
			}
			return null;
		},

		//////////////////////////////////////////////////////////////////////

		loadImage: function (name, callback, context) {
			var image = this.cache(name);
			if (image === null) {
				image = new Image();
				this.items[name] = image;
				++this.requests;
				ajax.get('img/' + name + '.png', {}, function (data) {
					image.src = 'data:image/png;base64,' + Util.btoa(data);
					if (typeof callback !== 'undefined') {
						callback.call(context, image);
					}
					++this.loaded;
				}, this, 'text/plain; charset=x-user-defined');
			}
			return image;
		},

		//////////////////////////////////////////////////////////////////////

		loadJSON: function (name, callback, context) {
			var d = this.cache(name);
			if (d === null) {
				d = {};
				++this.requests;
				this.items[name] = d;
				ajax.get('img/' + name + '.json', {}, function (data) {
					d = JSON.parse(data);
					if (typeof callback !== 'undefined') {
						callback.call(context, d);
					}
					++this.loaded;
				}, this);
			}
		}
	};

	return Loader;
}());
