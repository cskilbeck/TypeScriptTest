from letters import Letters

class Word:

    def __init__(word, direction):
        self.direction = direction
        self.word = word
        self.score = Letters.get_score(word)

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
