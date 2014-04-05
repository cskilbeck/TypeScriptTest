//////////////////////////////////////////////////////////////////////

var Matrix = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Matrix = function () {
        this.m = [1, 0, 0, 1, 0, 0];
    };

    //////////////////////////////////////////////////////////////////////

    Matrix.prototype = {

        //////////////////////////////////////////////////////////////////////

        setIdentity: function () {
            this.m = [1, 0, 0, 1, 0, 0];
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        translate: function (t) {
            this.m[4] += this.m[0] * t.x + this.m[2] * t.y;
            this.m[5] += this.m[1] * t.x + this.m[3] * t.y;
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        scale: function (s) {
            this.m[0] *= s.x;
            this.m[1] *= s.x;
            this.m[2] *= s.y;
            this.m[3] *= s.y;
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        rotate: function (radians) {
            var cos = Math.cos(radians),
                sin = Math.sin(radians),
                m11 = this.m[0] * cos + this.m[2] * sin,
                m12 = this.m[1] * cos + this.m[3] * sin,
                m21 = -this.m[0] * sin + this.m[2] * cos,
                m22 = -this.m[1] * sin + this.m[3] * cos;
            this.m[0] = m11;
            this.m[1] = m12;
            this.m[2] = m21;
            this.m[3] = m22;
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        apply: function (p) {
            return {
                x: p.x * this.m[0] + p.y * this.m[2] + this.m[4],
                y: p.x * this.m[1] + p.y * this.m[3] + this.m[5]
            };
        },

        //////////////////////////////////////////////////////////////////////

        transform: function (p) {
            var i;
            for (i = 0; i < p.length; ++i) {
                p[i] = this.apply(p[i]);
            }
            return p;
        }

    };

    return Matrix;

}());
