<?
$oauth2_provider_id     = '1';
$oauth2_client_id       = '1070809812407-drgaq8tgn9q9ill90jv5aumlap8d886s.apps.googleusercontent.com';
$oauth2_secret          = 'KjXpmMHAvDjdSDL8IrToxDih';
$oauth2_redirect        = 'http://make-the-words.com/oauth2callback';
$oauth2_redirect2       = 'http://make-the-words.com/oauth2callback';
$oauth2_server_url      = 'https://accounts.google.com/o/oauth2/auth';
$oauth2_scope           = 'https://www.googleapis.com/auth/userinfo.profile';
$oauth2_response_type   = 'code';
$oauth2_tokenurl        = 'https://accounts.google.com/o/oauth2/token';
$oauth2_grant_type      = 'authorization_code';
$oauth2_user_id_url     = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token={ACCESS_TOKEN}';

function get_picture_url($r) {
    return $r->picture;
}

?>