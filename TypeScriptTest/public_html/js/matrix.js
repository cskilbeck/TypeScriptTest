//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    chs.Matrix = chs.Class({

        $: function () {
            this.m = [1, 0, 0, 1, 0, 0];
        },

        set: function (a, b, c, d, e, f) {
            this.m[0] = a;
            this.m[1] = b;
            this.m[2] = c;
            this.m[3] = d;
            this.m[4] = e;
            this.m[5] = f;
            return this;
        },

        copyTo: function (m) {
            m.m[0] = this.m[0];
            m.m[1] = this.m[1];
            m.m[2] = this.m[2];
            m.m[3] = this.m[3];
            m.m[4] = this.m[4];
            m.m[5] = this.m[5];
        },

        copyFrom: function (m) {
            this.m[0] = m.m[0];
            this.m[1] = m.m[1];
            this.m[2] = m.m[2];
            this.m[3] = m.m[3];
            this.m[4] = m.m[4];
            this.m[5] = m.m[5];
        },

        setIdentity: function () {
            this.set(1, 0, 0, 1, 0, 0);
            return this;
        },

        multiplyInto: function(b, dest) {
            var x = this.m,
                y = b.m,
                r00 = x[0] * y[0] + x[2] * y[1],
                r01 = x[1] * y[0] + x[3] * y[1],
                r10 = x[0] * y[2] + x[2] * y[3],
                r11 = x[1] * y[2] + x[3] * y[3],
                r20 = x[0] * y[4] + x[2] * y[5] + x[4],
                r21 = x[1] * y[4] + x[3] * y[5] + x[5];
            dest.m[0] = r00;
            dest.m[1] = r01;
            dest.m[2] = r10;
            dest.m[3] = r11;
            dest.m[4] = r20;
            dest.m[5] = r21;
            return dest;
        },

        multiply: function (b) {
            return this.multiplyInto(b, this);
        },

        translate: function (t) {
            var x = this.m;
            x[4] += x[0] * t.x + x[2] * t.y;
            x[5] += x[1] * t.x + x[3] * t.y;
            return this;
        },

        translation: chs.Property({
            get: function () {
                return { x: this.m[4], y: this.m[5] };
            },
            set: function (t) {
                this.m[4] = t.x;
                this.m[5] = t.y;
            }
        }),

        scale: function (s) {
            var x = this.m;
            x[0] *= s.x;
            x[1] *= s.x;
            x[2] *= s.y;
            x[3] *= s.y;
            return this;
        },

        rotate: function (radians) {
            var m = this.m,
                cos = Math.cos(radians),
                sin = Math.sin(radians),
                r00 = m[0] * cos + m[2] * -sin,
                r01 = m[1] * cos + m[3] * -sin,
                r10 = m[0] * sin + m[2] * cos,
                r11 = m[1] * sin + m[3] * cos;
                m[0] = r00;
                m[1] = r01;
                m[2] = r10;
                m[3] = r11;
            return this;
        },

        invert: function (dest) {
            var m = this.m,
                det = m[0] * m[3] - m[1] * m[2];
            if (det < 1.0e-6) {
                return this.copyTo(dest);
            }
            det = 1 / det;
            dest.m[0] = m[3] * det;
            dest.m[1] = m[1] * -det;
            dest.m[2] = m[2] * -det;
            dest.m[3] = m[0] * det;
            dest.m[4] = (m[2] * m[5] - m[3] * m[4]) * det;
            dest.m[5] = (m[0] * m[5] - m[1] * m[4]) * -det;
            return dest;
        },

        apply: function (p) {
            return {
                x: p.x * this.m[0] + p.y * this.m[2] + this.m[4],
                y: p.x * this.m[1] + p.y * this.m[3] + this.m[5]
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
            context.setTransform(this.m[0], this.m[1], this.m[2], this.m[3], this.m[4], this.m[5]);
        }

    });

}());
