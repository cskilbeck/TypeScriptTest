\! echo '*** Create words table'
CREATE TABLE words (
    word_id         INT NOT NULL auto_increment,
                    PRIMARY KEY(word_id),
    word            VARCHAR(7) NOT NULL,
    user_id         INT NOT NULL,       -- who made it
    game_id         INT NOT NULL,       -- the game they were playing
    score           INT NOT NULL,       -- precalculated for easier querying
    time_stamp      DATETIME NOT NULL,  -- when they made it (roughly)
                    UNIQUE INDEX(word, game_id, user_id)
);
