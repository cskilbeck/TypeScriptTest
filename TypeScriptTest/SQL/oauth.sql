DROP TABLE IF EXISTS oauth_providers;

SELECT '*** Create oauth_providers table' as '';
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

SELECT '*** Insert oauth_providers' as '';
INSERT INTO oauth_providers (oauth_provider, oauth_name, oauth_icon, url, client_id, scope) VALUES
    (0, 'Anon',     'http://make-the-words.com/img/anon.png', NULL, NULL, NULL),
    (1, 'Google',   'http://www.google.com/images/logos/google_logo_41.png', 'https://accounts.google.com/o/oauth2/auth', '1070809812407-drgaq8tgn9q9ill90jv5aumlap8d886s.apps.googleusercontent.com', 'https://www.googleapis.com/auth/userinfo.profile'),
    (2, 'Facebook', 'https://www.facebookbrand.com/img/assets/asset.f.logo.lg.png', 'https://www.facebook.com/dialog/oauth', '224932627603132', 'public_profile'),
    (3, 'Yahoo',    'https://s1.yimg.com/rz/d/yahoo_en-GB_f_p_bestfit.png', NULL, NULL, NULL),
    (4, 'Live ID',  'http://c.s-microsoft.com/en-gb/CMSImages/store_symbol.png?version=e2eecca5-4550-10c6-57b1-5114804a4c01', 'https://login.live.com/oauth20_authorize.srf', '0000000044101D70', 'wl.basic wl.signin');

