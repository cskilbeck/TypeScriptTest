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

	function cache(l, name) {
		if (l.items.hasOwnProperty(name)) {
			return l.items[name];
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

		loadImage: function (name, callback, context) {
			var image = cache(this, name);
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
			var d = cache(this, name);
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
