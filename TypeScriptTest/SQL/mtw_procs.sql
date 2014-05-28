
DROP PROCEDURE IF EXISTS GETLB;
DROP PROCEDURE IF EXISTS GETLBPAGE;


DELIMITER //

CREATE PROCEDURE getLBPage(IN game_id INT, IN offset INT, IN pageSize INT)
begin
	SET @ranking = offset;
	SELECT	name, boards.user_id AS user_id, @ranking := CONVERT(@ranking, unsigned) + 1 AS rank, score
		FROM boards
		INNER JOIN users ON boards.user_id = users.user_id
		WHERE boards.game_id = game_id
		ORDER BY score DESC, time_stamp ASC
		LIMIT offset, pageSize;
END //


CREATE PROCEDURE getLB(IN boardid INT, IN offset INT, IN page_size INT)
BEGIN
	DECLARE placing INT;
	DECLARE gameScore INT;
	DECLARE boardTimeStamp DATETIME;
	DECLARE gameID INT;

	-- get the score/timestamp of the board
	SELECT score, time_stamp, game_id FROM boards WHERE board_id = boardid INTO gameScore, boardTimeStamp, gameID;

	-- get how many entries are above mine (2 users might have same score and time_stamp sometimes, that's ok)
	SELECT COUNT(*) FROM boards WHERE boards.game_id = gameID AND ((score > gameScore) OR (score = gameScore AND time_stamp < boardTimeStamp)) INTO placing;

	-- get the top of the expanded page (-10 to +10 instead of -5 to +5) (thanks Matt Picciocio)
	SET placing = placing + offset;
	SET placing = if(placing < 0, 0, placing);

	-- get the page of results
	CALL getLBPage(gameID, placing, page_size);

END //

DELIMITER ;

