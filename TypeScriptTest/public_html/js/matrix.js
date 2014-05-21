//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    function getDeterminant2x2(a) {
        return a[0] * a[3] - a[1] * a[2];
    }

    //////////////////////////////////////////////////////////////////////

    chs.Matrix = chs.Class({

        //////////////////////////////////////////////////////////////////////

        $: function (a, b, c, d, e, f, g, h, i) {
            this.m = [a, b, c, d, e, f, g, h, i];
        },

        //////////////////////////////////////////////////////////////////////

        static$: {

            identity: function () {
                return new chs.Matrix(1, 0, 0, 0, 1, 0, 0, 0, 1);
            },

            transRotScale: function (translation, rotation, scale) {
                return chs.Matrix.identity().translate(translation).rotate(rotation).scale(scale);
            }
        },

        copy: function (t) {
            return new chs.Matrix(
                this.m[0], this.m[1], this.m[2],
                this.m[3], this.m[4], this.m[5],
                this.m[6], this.m[7], this.m[8]);
        },

        transpose: function () {
            return new chs.Matrix(
                this.m[0], this.m[3], this.m[6],
                this.m[1], this.m[4], this.m[7],
                this.m[2], this.m[5], this.m[8]);
        },

        multiply: function (b) {
            var x = this.m,
                y = b.m;
            return new chs.Matrix(
                x[0] * y[0] + x[3] * y[1] + x[6] * y[2],
                x[1] * y[0] + x[4] * y[1] + x[7] * y[2],
                x[2] * y[0] + x[5] * y[1] + x[8] * y[2],

                x[0] * y[3] + x[3] * y[4] + x[2] * y[5],
                x[1] * y[3] + x[4] * y[4] + x[5] * y[5],
                x[2] * y[3] + x[5] * y[4] + x[8] * y[5],

                x[0] * y[6] + x[3] * y[7] + x[6] * y[8],
                x[1] * y[6] + x[4] * y[7] + x[7] * y[8],
                x[2] * y[6] + x[5] * y[7] + x[8] * y[8]
            );
        },

        translate: function (t) {
            return this.multiply(new chs.Matrix(1, 0, 0, 0, 1, 0, t.x, t.y, 1));
        },

        scale: function (s) {
            return this.multiply(new chs.Matrix(s.x, 0, 0, 0, s.y, 0, 0, 0, 1));
        },

        rotate: function (radians) {
            var cos = Math.cos(radians),
                sin = Math.sin(radians);
            return this.multiply(new chs.Matrix(cos, -sin, 0, sin, cos, 0, 0, 0, 1));
        },

        multiplyByScalar: function (num) {
            return new chs.Matrix(
                this.m[0] * num, this.m[1] * num, this.m[2] * num,
                this.m[3] * num, this.m[4] * num, this.m[5] * num,
                this.m[6] * num, this.m[7] * num, this.m[8] * num
            );
        },

        divideByScalar: function (num) {
            return this.multiplyByScalar(1 / num);
        },

        M: function (x, y) {
            return this.m[x + y * 3];
        },

        cofactor: function (x, y) {
            var i,
                j,
                nm = [];
            for (j = 0; j < 3; ++j) {
                for (i = 0; i < 3; ++i) {
                    if (i !== x && j !== y) {
                        nm.push(this.M(i, j));
                    }
                }
            }
            return nm;
        },

        determinant: function () {
            var i,
                d = 0,
                s = 1;
            for (i = 0; i < 3; ++i) {
                d += s * this.M(i, 0) * getDeterminant2x2(this.cofactor(i, 0));
                s = -s;
            }
            return d;
        },

        inverse: function () {
            var det = this.determinant(),
                m,
                j,
                i,
                s = 1;
            if (det < 1.0e-6) {
                return this.copy();
            } else {
                m = new chs.Matrix();
                for (j = 0; j < 3; ++j) {
                    for (i = 0; i < 3; ++i) {
                        m.m[j + i * 3] = s * getDeterminant2x2(this.cofactor(i, j));
                        s = -s;
                    }
                }
            }
            return m.multiplyByScalar(1 / det);
        },

        apply: function (p) {
            return {
                x: p.x * this.m[0] + p.y * this.m[3] + this.m[6],
                y: p.x * this.m[1] + p.y * this.m[4] + this.m[7]
            };
        },

        transform: function (p) {
            var i;
            for (i = 0; i < p.length; ++i) {
                p[i] = this.apply(p[i]);
            }
            return p;
        },

        setContextTransform: function (context) {
            context.setTransform(this.m[0], this.m[1], this.m[3], this.m[4], this.m[6], this.m[7]);
        }

    });

}());
