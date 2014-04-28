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

SELECT '*** Create sites' as '';
CREATE TABLE sites
(
	site_id			INT NOT NULL auto_increment,
					PRIMARY KEY(site_id),
	site_url		VARCHAR(255)
);

-- see data section below for list of oauth providers currently supported

SELECT '*** Create oauth_providers' as '';
CREATE TABLE oauth_providers
(
	oauth_id		INT NOT NULL,
					PRIMARY KEY(oauth_id),
	oauth_name		VARCHAR(32),
	oauth_icon		VARCHAR(5000)	-- url
);

-- people who have been seen logging in at some point
-- refresh the names each time they log in

SELECT '*** Create users' as '';
CREATE TABLE users
(
	user_id			VARCHAR(255) UNIQUE NOT NULL,
					PRIMARY KEY(user_id),
	oauth_id		INT NOT NULL,
	name			VARCHAR(255),
	first_name		VARCHAR(255),
	last_name		VARCHAR(255),
	email			VARCHAR(255),
	picture			VARCHAR(1024),
	link			VARCHAR(1024)
);

-- activity sessions
-- create a new one each time the web page is refreshed?
-- session is valid if:
--   created < now
--   now < expires
--   user_id exists in users table

SELECT '*** Create sessions' as '';
CREATE TABLE sessions
(
	session_id		INT NOT NULL auto_increment,
					PRIMARY KEY(session_id),
	user_id			VARCHAR(255) NOT NULL,
	created			DATETIME NOT NULL,
	expires			DATETIME NOT NULL
);

-- ----------------------------------------------------------------------
-- indices

SELECT '*** Create indices' as '';
CREATE INDEX sessions_user_id_index ON sessions(user_id);

-- ----------------------------------------------------------------------
-- views

SELECT '*** Create views' as '';
CREATE VIEW users_view AS
	SELECT user_id, name, first_name, last_name, oauth_name
	FROM users
		INNER JOIN oauth_providers ON users.oauth_id = oauth_providers.oauth_id
	ORDER BY last_name, first_name ASC;

-- ----------------------------------------------------------------------
-- data

-- these indices are globally specified and fixed, referenced from the web server as absolute values
-- we could use this table to specify the oauth endpoints and parameters one day (but not client secrets)

SELECT '*** Insert oauth_providers' as '';
INSERT INTO oauth_providers (oauth_id, oauth_name, oauth_icon) VALUES
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
