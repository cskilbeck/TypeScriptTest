from letters import Letters

class Word:

    horizontal = 0
    vertical = 1

    def __init__(word, x, y, direction, score):
        self.word = word
        self.x = x
        self.y = y
        self.direction = direction
        self.score = score

    @staticmethod
    def compare(x, y):
        if x.score < y.score:
            return -1
        if x.score > y.score:
            return 1
        if len(x.word) < len(y.word):
            return -1
        if len(x.word) > len(y.word):
            return 1
        if x.word < y.word:
            return -1
        if x.word > y.word:
            return 1
        return 0
