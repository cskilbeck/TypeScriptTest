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

        copy: function (t) {
            var m = new Matrix();
            m.m[0] = this.m[0];
            m.m[1] = this.m[1];
            m.m[2] = this.m[2];
            m.m[3] = this.m[3];
            m.m[4] = this.m[4];
            m.m[5] = this.m[5];
            return m;
        },

        //////////////////////////////////////////////////////////////////////

        setIdentity: function () {
            this.m = [1, 0, 0, 1, 0, 0];
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        translate: function (t) {
            var m = this.copy();
            m.m[4] += m.m[0] * t.x + m.m[2] * t.y;
            m.m[5] += m.m[1] * t.x + m.m[3] * t.y;
            return m;
        },

        //////////////////////////////////////////////////////////////////////

        scale: function (s) {
            var m = this.copy();
            m.m[0] *= s.x;
            m.m[1] *= s.x;
            m.m[2] *= s.y;
            m.m[3] *= s.y;
            return m;
        },

        //////////////////////////////////////////////////////////////////////

        rotate: function (radians) {
            var m = this.copy(),
                cos = Math.cos(radians),
                sin = Math.sin(radians),
                m11 = m.m[0] * cos + m.m[2] * sin,
                m12 = m.m[1] * cos + m.m[3] * sin,
                m21 = -m.m[0] * sin + m.m[2] * cos,
                m22 = -m.m[1] * sin + m.m[3] * cos;
            m.m[0] = m11;
            m.m[1] = m12;
            m.m[2] = m21;
            m.m[3] = m22;
            return m;
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
