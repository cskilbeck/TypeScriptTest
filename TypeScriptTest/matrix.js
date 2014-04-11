//////////////////////////////////////////////////////////////////////

var Matrix = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var Matrix = function (arr) {
        this.m = arr;
    };

    //////////////////////////////////////////////////////////////////////

    Matrix.identity = function () {
        return new Matrix([1, 0, 0, 1, 0, 0]);
    };

    //////////////////////////////////////////////////////////////////////

    Matrix.transRotScale = function (translation, rotation, scale) {
        return Matrix.identity().translate(translation).rotate(rotation).scale(scale);
    };

    //////////////////////////////////////////////////////////////////////

    Matrix.prototype = {

        //////////////////////////////////////////////////////////////////////

        copy: function (t) {
            return new Matrix([
                this.m[0],
                this.m[1],
                this.m[2],
                this.m[3],
                this.m[4],
                this.m[5]
            ]);
        },

        //////////////////////////////////////////////////////////////////////

        multiply: function (b) {
            var x = this.m,
                y = b.m;
            return new Matrix([
                x[0] * y[0] + x[2] * y[1],
                x[1] * y[0] + x[3] * y[1],
                x[0] * y[2] + x[2] * y[3],
                x[1] * y[2] + x[3] * y[3],
                x[0] * y[4] + x[2] * y[5] + x[4],
                x[1] * y[4] + x[3] * y[5] + x[5]
            ]);
        },

        //////////////////////////////////////////////////////////////////////

        translate: function (t) {
            return new Matrix([
                this.m[0],
                this.m[1],
                this.m[2],
                this.m[3],
                this.m[4] + this.m[0] * t.x + this.m[2] * t.y,
                this.m[5] + this.m[1] * t.x + this.m[3] * t.y
            ]);
        },

        //////////////////////////////////////////////////////////////////////

        scale: function (s) {
            return new Matrix([
                this.m[0] * s.x,
                this.m[1] * s.x,
                this.m[2] * s.y,
                this.m[3] * s.y,
                this.m[4],
                this.m[5]
            ]);
        },

        //////////////////////////////////////////////////////////////////////

        rotate: function (radians) {
            var cos = Math.cos(radians),
                sin = Math.sin(radians);
            return new Matrix([
                this.m[0] * cos + this.m[2] * sin,
                this.m[1] * cos + this.m[3] * sin,
                -this.m[0] * sin + this.m[2] * cos,
                -this.m[1] * sin + this.m[3] * cos,
                this.m[4],
                this.m[5]
            ]);
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
