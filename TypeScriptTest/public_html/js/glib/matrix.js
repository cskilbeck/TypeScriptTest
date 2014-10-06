(function () {
    "use strict";

    function copy(m, n) {
        m[0] = n[0];
        m[1] = n[1];
        m[2] = n[2];
        m[3] = n[3];
        m[4] = n[4];
        m[5] = n[5];
    }

    glib.Matrix = glib.Class({

        // constructor

        $: function () {
            this.m = [1, 0, 0, 1, 0, 0];
        },

        // replace contents

        set: function (a, b, c, d, e, f) {
            var m = this.m;
            m[0] = a;
            m[1] = b;
            m[2] = c;
            m[3] = d;
            m[4] = e;
            m[5] = f;
            return this;
        },

        // copy into another matrix

        copyTo: function (o) {
            copy(o.m, this.m);
        },

        // copy from another matrix

        copyFrom: function (o) {
            copy(this.m, o.m);
        },

        // set it to the identity matrix

        setIdentity: function () {
            this.set(1, 0, 0, 1, 0, 0);
            return this;
        },

        // dest = this * b

        multiplyInto: function(b, dest) {
            var m = this.m,
                y = b.m,
                d = dest.m,
                r00 = m[0] * y[0] + m[2] * y[1],
                r01 = m[1] * y[0] + m[3] * y[1],
                r10 = m[0] * y[2] + m[2] * y[3],
                r11 = m[1] * y[2] + m[3] * y[3],
                r20 = m[0] * y[4] + m[2] * y[5] + m[4],
                r21 = m[1] * y[4] + m[3] * y[5] + m[5];
            d[0] = r00;
            d[1] = r01;
            d[2] = r10;
            d[3] = r11;
            d[4] = r20;
            d[5] = r21;
            return dest;
        },

        // this = this * b

        multiply: function (b) {
            return this.multiplyInto(b, this);
        },

        // translate by t.x, t.y

        translate: function (t) {
            var m = this.m;
            m[4] += m[0] * t.x + m[2] * t.y;
            m[5] += m[1] * t.x + m[3] * t.y;
            return this;
        },

        // don't use this...

        translation: glib.Property({
            get: function () {
                return { x: this.m[4], y: this.m[5] };
            },
            set: function (t) {
                this.m[4] = t.x;
                this.m[5] = t.y;
            }
        }),

        // scale it by s.x, s.y

        scale: function (s) {
            var x = this.m;
            x[0] *= s.x;
            x[1] *= s.x;
            x[2] *= s.y;
            x[3] *= s.y;
            return this;
        },

        // rotate by radians

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

        // dest = inverse(this) - good for picking

        invert: function (dest) {
            var m = this.m,
                det = m[0] * m[3] - m[1] * m[2];
            if (det < 1.0e-6) {
                return this.copyTo(dest);
            }
            det = 1 / det;
            return dest.set(m[3] * det, m[1] * -det, m[2] * -det, m[0] * det,
                            (m[2] * m[5] - m[3] * m[4]) * det,
                            (m[0] * m[5] - m[1] * m[4]) * -det);
        },

        // apply to point p

        apply: function (p) {
            var m = this.m;
            return {
                x: p.x * m[0] + p.y * m[2] + m[4],
                y: p.x * m[1] + p.y * m[3] + m[5]
            };
        },

        // transform array of points in place

        transform: function (p) {
            var m = this.m,
                i,
                x,
                y;
            for (i = 0; i < p.length; ++i) {
                x = p[i].x;
                y = p[i].y;
                p[i].x = x * m[0] + y * m[2] + m[4];
                p[i].y = x * m[1] + y * m[3] + m[5];
            }
            return p;
        },

        // stuff it into a context

        setContextTransform: function (context) {
            var m = this.m;
            context.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
        }

    });

}());
