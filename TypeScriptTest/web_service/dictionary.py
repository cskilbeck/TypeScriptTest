import json

class Dictionary(object):
    
    def __init__(self):
        with open('dictionary.json') as json_data:
            self.dictionary = json.loads(json_data)
            json_data.close()

    def is_word(w):
        return w in self.dictionary

    def score(w):
        if is_word(w):
            pass
        else:
            return 0
