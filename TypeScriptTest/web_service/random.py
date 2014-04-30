﻿def _rshift(x, y):
    return (x & 0xFFFFFFFF) >> y

class Random:

    def __init__(self, seed = 1):
        self.seed(seed)

    def seed(s):
        self.x = 123456789
        self.y = 362436069
        self.z = 521288629
        self.w = 88675123
        self.v = seed

    def next():
        t = x ^ _rshift(x,7)
        x = y
        y = z
        z = w
        w = v
        v = v ^ (v << 6) ^ (t ^ (t << 13))
        return _rshift((y + y + 1) * v, 16)
