chs.Cookies = (function () {
    "use strict";

    return {

        set: function (name, value, expiry) {
            var d = new Date(),
                expires;
            d.setTime(d.getTime() + ((expiry || 1) * 24 * 60 * 60 * 1000));
            expires = "expires=" + d.toGMTString();
            document.cookie = name + "=" + value + "; " + expires;
        },

        get: function (name) {
            var cname = name + "=",
                ca,
                i,
                c;
            ca = document.cookie.split(';');
            for (i = 0; i < ca.length; i++) {
                c = ca[i].trim();
                if (c.indexOf(cname) === 0) {
                    return c.substring(cname.length, c.length);
                }
            }
            return null;
        },

        remove: function (name) {
            chs.Cookies.set(name, "", -1);
        }

    };

}());