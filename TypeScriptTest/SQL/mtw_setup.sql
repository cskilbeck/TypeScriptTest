-- ----------------------------------------------------------------------
-- Make The Words mysql setup script
-- ----------------------------------------------------------------------

\! echo '**************************************************************************'
\! echo '*** Database setup begins'

\! echo '*** Drop'
DROP DATABASE IF EXISTS mtwdb;

\! echo '*** Create'
CREATE DATABASE mtwdb;

\! echo '*** Use'
USE mtwdb;

-- ----------------------------------------------------------------------
-- tables

-- these web sites can use the web service

\! echo '*** Create sites table'
CREATE TABLE sites
(
	site_id			INT NOT NULL auto_increment,
					PRIMARY KEY(site_id),
	site_url		VARCHAR(255)
);

-- see data section below for list of oauth providers currently supported

\! echo '*** Create anon table'
CREATE TABLE anons (
	anon_id			INT NOT NULL auto_increment,
					PRIMARY KEY(anon_id),
	created			DATETIME NOT NULL
);

-- users

\! echo '*** Create users table'
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

-- sessions, still not sure why I need this

\! echo '*** Create sessions table'
CREATE TABLE sessions
(
	session_id		INT NOT NULL auto_increment,
					PRIMARY KEY(session_id),
	user_id			VARCHAR(255) NOT NULL,
	created			DATETIME NOT NULL,
	expires			DATETIME NOT NULL
);

-- games

\! echo '*** Create games table'
CREATE TABLE games
(
	game_id			INT NOT NULL auto_increment,
					PRIMARY KEY(game_id),
	seed			INT NOT NULL,
	start_time		DATETIME,
	end_time		DATETIME
);

-- all the boards for the leaderboards

\! echo '*** Create boards table'
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

-- oauth_providers

\! echo '*** Create oauth_providers table'
CREATE TABLE oauth_providers
(
    oauth_provider  INT NOT NULL,               -- const reference (Google = 1, Facebook = 2 etc)
                    PRIMARY KEY(oauth_provider),
    oauth_name      VARCHAR(32),                -- 'Google', 'Facebook' etc
    oauth_icon      VARCHAR(5000),              -- url of an icon to show on login screen
    url             VARCHAR(5000),
    client_id       VARCHAR(5000),
    scope           VARCHAR(5000)
);

-- ----------------------------------------------------------------------
-- indices

\! echo '*** Create indices'
CREATE INDEX sessions_user_id_index ON sessions(user_id);

-- ----------------------------------------------------------------------
-- views

\! echo '*** Create views'
CREATE VIEW users_view AS
	SELECT user_id, name, oauth_name, oauth_sub
	FROM users
		INNER JOIN oauth_providers ON users.oauth_provider = oauth_providers.oauth_provider
	ORDER BY name ASC;

-- ----------------------------------------------------------------------
-- data

-- these indices are globally specified and fixed, referenced from the web server as absolute values
-- we could use this table to specify the oauth endpoints and parameters one day (but not client secrets)

\! echo '*** Insert oauth_providers'
INSERT INTO oauth_providers (oauth_provider, oauth_name, oauth_icon, url, client_id, scope) VALUES
    (0, 'Anon',     'http://make-the-words.com/img/anon.png', NULL, NULL, NULL),
    (1, 'Google',   'http://www.google.com/images/logos/google_logo_41.png', 'https://accounts.google.com/o/oauth2/auth', '1070809812407-drgaq8tgn9q9ill90jv5aumlap8d886s.apps.googleusercontent.com', 'https://www.googleapis.com/auth/userinfo.profile'),
    (2, 'Facebook', 'https://www.facebookbrand.com/img/assets/asset.f.logo.lg.png', 'https://www.facebook.com/dialog/oauth', '224932627603132', 'public_profile'),
    (4, 'Microsoft',  'http://c.s-microsoft.com/en-gb/CMSImages/store_symbol.png?version=e2eecca5-4550-10c6-57b1-5114804a4c01', 'https://login.live.com/oauth20_authorize.srf', '0000000044101D70', 'wl.basic wl.signin');


\! echo '*** Insert sites'
INSERT INTO sites(site_url) VALUES
	('http://make-the-words.com'),
	('http://debian.local');

-- ----------------------------------------------------------------------
-- procedures

\! echo '*** Source procedures'
source sql/mtw_procs.sql

\! echo
SELECT site_url AS '*** Valid_Clients:' FROM sites;
\! echo
SELECT oauth_name AS '*** OAuth_Providers:' FROM oauth_providers;
\! echo
SELECT specific_name as '*** Procedures' FROM mysql.proc WHERE definer LIKE CONCAT('%', CONCAT((SUBSTRING_INDEX((SELECT user()), '@', 1)), '%'));

\! echo '*** Database setup is complete'
\! echo '**************************************************************************'
