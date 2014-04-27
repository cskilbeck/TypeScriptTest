-- ----------------------------------------------------------------------
-- Make The Words mysql setup script
-- analytics/telemetry...
-- ----------------------------------------------------------------------

DROP database IF EXISTS mtwdb;
CREATE database mtwdb;
USE mtwdb;

-- ----------------------------------------------------------------------
-- tables

-- see data section below for list of oauth providers currently supported

CREATE TABLE oauth_providers
(
	oauth_id		INT NOT NULL,
					PRIMARY KEY(oauth_id),
	oauth_name		VARCHAR(32),
	oauth_icon		VARCHAR(255)	-- url
);

-- people who have been seen logging in at some point
-- refresh the names each time they log in

CREATE TABLE users
(
	user_id			INT NOT NULL auto_increment,
					PRIMARY KEY(user_id),
	oauth_id		INT NOT NULL,
	oauth_sub		VARCHAR(255),
	name			VARCHAR(255),
	first_name		VARCHAR(255),
	last_name		VARCHAR(255),
	first_seen		DATETIME,
	last_seen		DATETIME
);

-- activity sessions
-- create a new one each time the web page is refreshed?
-- session is valid if:
--   ip_address is same
--   created < now
--   now < expires
--   user_id exists in users table

CREATE TABLE sessions
(
	session_id		INT NOT NULL auto_increment,
					PRIMARY KEY(session_id),
	user_id			INT NOT NULL,
	created			DATETIME NOT NULL,
	expires			DATETIME NOT NULL,
	ip_address		INT UNSIGNED NOT NULL
);

-- ----------------------------------------------------------------------
-- indices

CREATE INDEX oauth_id_index ON users(oauth_id);
CREATE INDEX sessions_user_id_index ON sessions(user_id);

-- ----------------------------------------------------------------------
-- views

CREATE VIEW users_view AS
	SELECT user_id, name, first_name, last_name, oauth_name
	FROM users
		INNER JOIN oauth_providers ON users.oauth_id = oauth_providers.oauth_id
	ORDER BY last_name, first_name ASC;

-- ----------------------------------------------------------------------
-- procedures

source sql/mtw_procs.sql

SELECT db, type, specific_name, param_list, returns FROM mysql.proc WHERE definer LIKE CONCAT('%', CONCAT((SUBSTRING_INDEX((SELECT user()), '@', 1)), '%'));

-- ----------------------------------------------------------------------
-- data

-- these indices are globally specified and fixed, referenced from the web server as absolute values
-- we could use this table to specify the oauth endpoints and parameters one day...

INSERT INTO oauth_providers (oauth_id, oauth_name, oauth_icon) VALUES
	(0,	'Bot',		'http://www.make-the-words.com/bot.png'),
	(1,	'Google',	'http://www.google.com/images/logos/google_logo_41.png'),
	(2,	'Facebook',	'https://www.facebookbrand.com/img/assets/asset.f.logo.lg.png'),
	(3,	'Yahoo',	'https://s1.yimg.com/rz/d/yahoo_en-GB_f_p_bestfit.png'),
	(4, 'Live ID', 	'http://c.s-microsoft.com/en-gb/CMSImages/store_symbol.png?version=e2eecca5-4550-10c6-57b1-5114804a4c01')
