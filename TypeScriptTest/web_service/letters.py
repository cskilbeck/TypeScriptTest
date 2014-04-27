from random import Random

class Letters:

    letters = [
        { score: 1, frequency: 9 },     #A
        { score: 3, frequency: 2 },     #B
        { score: 3, frequency: 2 },     #C
        { score: 2, frequency: 4 },     #D
        { score: 1, frequency: 12 },    #E
        { score: 4, frequency: 2 },     #F
        { score: 2, frequency: 3 },     #G
        { score: 4, frequency: 2 },     #H
        { score: 1, frequency: 9 },     #I
        { score: 8, frequency: 1 },     #J
        { score: 5, frequency: 1 },     #K
        { score: 1, frequency: 4 },     #L
        { score: 3, frequency: 2 },     #M
        { score: 1, frequency: 6 },     #N
        { score: 1, frequency: 8 },     #O
        { score: 3, frequency: 2 },     #P
        { score: 10, frequency: 1 },    #Q
        { score: 1, frequency: 6 },     #R
        { score: 1, frequency: 4 },     #S
        { score: 1, frequency: 6 },     #T
        { score: 1, frequency: 4 },     #U
        { score: 4, frequency: 2 },     #V
        { score: 4, frequency: 2 },     #W
        { score: 8, frequency: 1 },     #X
        { score: 4, frequency: 2 },     #Y
        { score: 10, frequency: 1 }     #Z
    ]

    distribution = []

    @staticmethod
    def init():
        letter = 97 # a
        for l in letters:
            for i in range(l.frequency):
                distribution.append(chr(letter))
            letter += 1

    @staticmethod
    def get_random_letter(rand):
        return distribution[rand.next() % len(distribution)]

    @staticmethod
    def get_score(word):
        score = 0
        for l in word:
            score += letters[ord(word[l])-97].score
        return score
