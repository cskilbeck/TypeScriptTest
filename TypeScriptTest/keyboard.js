//////////////////////////////////////////////////////////////////////

var Keyboard = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var held = [],
        pressed = [],
        released = [],
        previous = [],
        q = [],
        clr = [],
        lastKey,

        keyLookup = {
            none: 0,
            backspace: 8,
            tab: 9,
            enter: 13,
            shift: 16,
            ctrl: 17,
            space: 32,
            pgup: 33,
            pgdn: 34,
            end: 35,
            home: 36,
            left: 37,
            up: 38,
            right: 39,
            down: 40,
            ins: 45,
            del: 46,
            0: 48,
            1: 49,
            2: 50,
            3: 51,
            4: 52,
            5: 53,
            6: 54,
            7: 55,
            8: 56,
            9: 57,
            a: 65,
            b: 66,
            c: 67,
            d: 68,
            e: 69,
            f: 70,
            g: 71,
            h: 72,
            i: 73,
            j: 74,
            k: 75,
            l: 76,
            m: 77,
            n: 78,
            o: 79,
            p: 80,
            q: 81,
            r: 82,
            s: 83,
            t: 84,
            u: 85,
            v: 86,
            w: 87,
            x: 88,
            y: 89,
            z: 90
        },

    //////////////////////////////////////////////////////////////////////

        keyNames = {
            0: "none",
            8: "backspace",
            9: "tab",
            13: "enter",
            16: "shift",
            17: "ctrl",
            32: "space",
            33: "pgup",
            34: "pgdn",
            35: "end",
            36: "home",
            37: "left",
            38: "up",
            39: "right",
            40: "down",
            45: "ins",
            46: "del",
            48: "0",
            49: "1",
            50: "2",
            51: "3",
            52: "4",
            53: "5",
            54: "6",
            55: "7",
            56: "8",
            57: "9",
            65: "a",
            66: "b",
            67: "c",
            68: "d",
            69: "e",
            70: "f",
            71: "g",
            72: "h",
            73: "i",
            74: "j",
            75: "k",
            76: "l",
            77: "m",
            78: "n",
            79: "o",
            80: "p",
            81: "q",
            82: "r",
            83: "s",
            84: "t",
            85: "u",
            86: "v",
            87: "w",
            88: "x",
            89: "y",
            90: "z"
        };

    //////////////////////////////////////////////////////////////////////

    return {

        //////////////////////////////////////////////////////////////////////

        init: function () {
            var i = 0;
            for (i = 0; i < 255; i += 1) {
                held[i] = false;
                pressed[i] = false;
                released[i] = false;
                previous[i] = false;
            }

            window.addEventListener('keydown', function (e) {
                q.push({ key: e.which, action: true });
            }, false);

            window.addEventListener('keyup', function (e) {
                q.push({ key: e.which, action: false });
            }, false);
        },

        //////////////////////////////////////////////////////////////////////

        update: function () {

            var last = 0;
            while (clr.length > 0) {
                if (clr[0].action) {
                    pressed[clr[0].key] = false;
                } else {
                    released[clr[0].key] = false;
                }
                clr.shift();
            }

            while (q.length > 0) {
                if (q[0].action) {
                    pressed[q[0].key] = true;
                    held[q[0].key] = true;
                    last = q[0].key;
                } else {
                    released[q[0].key] = true;
                    held[q[0].key] = false;
                }
                clr.push(q.shift());
            }
            lastKey = last !== 0 ? keyNames[last] : null;
        },

        //////////////////////////////////////////////////////////////////////

        held: function (key) {
            return held[keyLookup[key.toLowerCase()]];
        },

        //////////////////////////////////////////////////////////////////////

        pressed: function (key) {
            return pressed[keyLookup[key.toLowerCase()]];
        },

        //////////////////////////////////////////////////////////////////////

        released: function (key) {
            return released[keyLookup[key.toLowerCase()]];
        },

        //////////////////////////////////////////////////////////////////////

        lastKeyPressed: function () {
            return lastKey;
        }
    };

}());

