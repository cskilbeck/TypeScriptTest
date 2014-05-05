-- allow users to continue their current game (get board from boards table)
-- allow users to view highscore of game in progress (with rankings)

drop procedure if exists getLeaderboard;
drop procedure if exists updateRankings;
drop procedure if exists getLB;

delimiter //

create procedure getLeaderboard(in boardID int)
begin
	declare gameID int;
	declare myScore int;
	declare placing int;
	select `game_id`, `score` into gameID, myScore from boards where board_id=boardID;
	select count(*) into placing from `boards` where `score` >= myScore and `game_id`=gameID order by `score` desc, `time_stamp` asc;
	set placing = placing - 5;
	set placing = if(placing < 0, 0, placing);
	select * from `boards` inner join `people` on `people`.`facebook_id`=`boards`.`facebook_id` where `game_id`=gameID order by `score` desc, `time_stamp` asc limit placing, 9;
end //

create procedure getLB(in boardID int)
begin
	prepare stmt from "
	select	seed,
			name,
			boards.user_id,
			time_stamp,
			board,
			@prev := @curr,
			@curr := score,
			@rank := if(@prev = @curr, @rank, @rank+1) as rank,
			score
	from boards
	inner join users on boards.user_id = users.user_id,
			(select @curr := null, @prev := null, @rank := 0) sel1
	order by score desc, time_stamp asc
	limit ?, 30;";

	set	@gameScore = 0,
		@boardTimeStamp = null,
		@leaderboard_topsize = 0;

	-- get the score/timestamp of the board
	select `score`, `time_stamp` from `boards` where `board_id` = boardID into @gameScore, @boardTimeStamp;

	-- get how many entries are above mine (2 users will have same score and time_stamp sometimes, that's ok)
	select count(*) from `boards` where (`score` > @gameScore) or (`score` = @gameScore and `time_stamp` < @boardTimeStamp) into @leaderboard_topsize;

	-- get the top of the expanded page (-10 to +10 instead of -5 to +5) (thanks Matt Picciocio)
	set @leaderboard_topsize = @leaderboard_topsize - 10;
	set @leaderboard_topsize = if(@leaderboard_topsize < 0, 0, @leaderboard_topsize);

	execute stmt using @leaderboard_topsize;

	deallocate prepare stmt;

end //




delimiter ;