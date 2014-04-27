def rshift(x, y):
    return (x % 0x100000000) >> y

class Random(object):

    def __init__(self, seed = 1):
        self.seed(seed)

    def seed(s):
        self.x = 123456789
        self.y = 362436069
        self.z = 521288629
        self.w = 88675123
        self.v = seed

    def next():
        t = x ^ rshift(x,7)
        x = y
        y = z
        z = w
        w = v
        v = v ^ (v << 6) ^ (t ^ (t << 13))
        return rshift((y + y + 1) * v, 16)
