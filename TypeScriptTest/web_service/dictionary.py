import json
from letters import Letters

class Dictionary:

    dictionary = None

    @staticmethod    
    def init():
        with open('dictionary.json') as json_data:
            dictionary = json.loads(json_data)
            json_data.close()

    @staticmethod    
    def is_word(w):
        return w in dictionary

    @staticmethod    
    def score(w):
        if is_word(w):
            return Letters.get_score(w)
        else:
            return 0
