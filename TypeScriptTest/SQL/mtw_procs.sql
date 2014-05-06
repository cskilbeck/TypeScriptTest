
drop procedure if exists getLB;

delimiter //

create procedure getLB(in boardID int, in buffer int)
begin
	prepare stmt from "
	select	name,
			boards.user_id as user_id,
			@rank := convert(@rank, unsigned) + 1 as rank,
			score
	from boards
	inner join users on boards.user_id = users.user_id, (select @rank := ?) sel1
	order by score desc, time_stamp asc
	limit ?, ?;";

	set	@gameScore = 0,
		@boardTimeStamp = null,
		@leaderboard_topsize = 0,
		@pageSize = buffer + buffer + 1,
		@bufferOffset = buffer;

	-- get the score/timestamp of the board
	select `score`, `time_stamp` from `boards` where `board_id` = boardID into @gameScore, @boardTimeStamp;

	-- get how many entries are above mine (2 users will have same score and time_stamp sometimes, that's ok)
	select count(*) from `boards` where (`score` > @gameScore) or (`score` = @gameScore and `time_stamp` < @boardTimeStamp) into @leaderboard_topsize;

	-- get the top of the expanded page (-10 to +10 instead of -5 to +5) (thanks Matt Picciocio)
	set @leaderboard_topsize = @leaderboard_topsize - @bufferOffset;
	set @leaderboard_topsize = if(@leaderboard_topsize < 0, 0, @leaderboard_topsize);

	execute stmt using @leaderboard_topsize, @leaderboard_topsize, @pageSize;

	deallocate prepare stmt;

end //

delimiter ;
