-- ----------------------------------------------------------------------
-- Make The Words mysql setup script
-- ----------------------------------------------------------------------

SELECT '*** Database setup begins' as '';

SELECT '*** Drop' as '';
DROP DATABASE IF EXISTS mtwdb;

SELECT '*** Create' as '';
CREATE DATABASE mtwdb;

SELECT '*** Use' as '';
USE mtwdb;

-- ----------------------------------------------------------------------
-- tables

-- these web sites can use the web service

SELECT '*** Create sites table' as '';
CREATE TABLE sites
(
	site_id			INT NOT NULL auto_increment,
					PRIMARY KEY(site_id),
	site_url		VARCHAR(255)
);

-- see data section below for list of oauth providers currently supported

SELECT '*** Create oauth_providers table' as '';
CREATE TABLE oauth_providers
(
	oauth_provider	INT NOT NULL,				-- const reference (Google = 1, Facebook = 2 etc)
					PRIMARY KEY(oauth_provider),
	oauth_name		VARCHAR(32),				-- 'Google', 'Facebook' etc
	oauth_icon		VARCHAR(5000)				-- url of an icon to show on login screen
);

SELECT '*** Create users table' as '';
CREATE TABLE users
(
	user_id			INT NOT NULL auto_increment,
					PRIMARY KEY(user_id),
	oauth_sub		VARCHAR(255) NOT NULL,
	oauth_provider	INT NOT NULL,
	name			VARCHAR(255),
	picture			VARCHAR(1024),
					UNIQUE INDEX (oauth_sub, oauth_provider)
);

SELECT '*** Create sessions table' as '';
CREATE TABLE sessions
(
	session_id		INT NOT NULL auto_increment,
					PRIMARY KEY(session_id),
	user_id			VARCHAR(255) NOT NULL,
	created			DATETIME NOT NULL,
	expires			DATETIME NOT NULL
);

SELECT '*** Create games table' as '';
CREATE TABLE games
(
	game_id			INT NOT NULL auto_increment,
					PRIMARY KEY(game_id),
	seed			INT NOT NULL,
	start_time		DATETIME,
	end_time		DATETIME
);

SELECT '*** Create boards table' as '';
CREATE TABLE boards
(
	board_id		INT NOT NULL auto_increment,
					PRIMARY KEY(board_id),
	seed			INT NOT NULL,
	board			CHAR(35) NOT NULL,
	score			INT NOT NULL,
	user_id			INT NOT NULL,
	time_stamp		DATETIME NOT NULL,
					UNIQUE INDEX (user_id, seed)
);

-- ----------------------------------------------------------------------
-- indices

SELECT '*** Create indices' as '';
CREATE INDEX sessions_user_id_index ON sessions(user_id);

-- ----------------------------------------------------------------------
-- views

SELECT '*** Create views' as '';
CREATE VIEW users_view AS
	SELECT user_id, name, picture, oauth_name, oauth_sub
	FROM users
		INNER JOIN oauth_providers ON users.oauth_provider = oauth_providers.oauth_provider
	ORDER BY name ASC;

-- ----------------------------------------------------------------------
-- data

-- these indices are globally specified and fixed, referenced from the web server as absolute values
-- we could use this table to specify the oauth endpoints and parameters one day (but not client secrets)

SELECT '*** Insert oauth_providers' as '';
INSERT INTO oauth_providers (oauth_provider, oauth_name, oauth_icon) VALUES
	(0,	'Bot',		'http://www.make-the-words.com/bot.png'),
	(1,	'Google',	'http://www.google.com/images/logos/google_logo_41.png'),
	(2,	'Facebook',	'https://www.facebookbrand.com/img/assets/asset.f.logo.lg.png'),
	(3,	'Yahoo',	'https://s1.yimg.com/rz/d/yahoo_en-GB_f_p_bestfit.png'),
	(4, 'Live ID', 	'http://c.s-microsoft.com/en-gb/CMSImages/store_symbol.png?version=e2eecca5-4550-10c6-57b1-5114804a4c01');

SELECT '*** Insert sites' as '';
INSERT INTO sites(site_url) VALUES
	('http://www.make-the-words.com'),
	('http://make-the-words.com');

-- ----------------------------------------------------------------------
-- procedures

SELECT '*** Source procedures' as '';
source sql/mtw_procs.sql

SELECT '' as '';
SELECT site_url AS '*** Valid_Clients:' FROM sites;
SELECT '' as '';
SELECT oauth_name AS '*** OAuth_Providers:' FROM oauth_providers;
SELECT '' as '';
SELECT specific_name as '*** Procedures' FROM mysql.proc WHERE definer LIKE CONCAT('%', CONCAT((SUBSTRING_INDEX((SELECT user()), '@', 1)), '%'));

SELECT '*** Database setup is complete' as '';
