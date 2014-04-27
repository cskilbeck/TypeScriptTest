from random import Random
from letters import Letters

class Board:

    def __init__(self, w, h):
        self.width = w
        self.height = h
        self.board = [None] * (w * h)
        self.random = Random()

    def letter(x, y):
        return self.board[self.width * y + x]

    def randomize(seed):
        self.random.seed(seed)
