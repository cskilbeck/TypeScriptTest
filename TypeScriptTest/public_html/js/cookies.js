chs.Cookies = (function () {
    "use strict";

    return {

        set: function (name, value, expiry) {
            var d = new Date(),
                expires;
            d.setTime(d.getTime() + ((expiry || 1) * 24 * 60 * 60 * 1000));
            expires = "expires=" + d.toGMTString();
            document.cookie = name + "=" + value + "; " + expires + ";path=/";
            console.log("Set " + name + " to " + value);
        },

        get: function (name) {
            var cname = name + "=",
                ca,
                i,
                c,
                v;
            ca = document.cookie.split(';');
            for (i = 0; i < ca.length; i++) {
                c = ca[i].trim();
                if (c.indexOf(cname) === 0) {
                    v = decodeURIComponent(c.substring(cname.length, c.length));
                    console.log("Got " + name + " is " + v);
                    return v;
                }
            }
            console.log("Cookie " + name + " is not there");
            return null;
        },

        remove: function (name) {
            chs.Cookies.set(name, "", -1);
        }
    };

}());