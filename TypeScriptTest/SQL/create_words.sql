\! echo '*** Create words table'

DROP TABLE IF EXISTS words;

CREATE TABLE words (
    word_id         INT NOT NULL auto_increment,
                    PRIMARY KEY(word_id),
    word            VARCHAR(7) NOT NULL,
    user_id         INT NOT NULL,       -- who made it
    game_id         INT NOT NULL,       -- in this game
    score           INT NOT NULL,       -- precalculated for easier querying
                    UNIQUE INDEX(word, game_id)
);
