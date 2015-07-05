<?
$oauth2_provider_id     = '2';
$oauth2_client_id       = '224932627603132';
$oauth2_secret          = 'e6f6e69b22e2c2b0b949a6f5611c3052';
$oauth2_redirect        = 'http://skilbeck.com/mtw/oauth2callback_debug';
$oauth2_redirect2       = 'http://skilbeck.com/mtw/oauth2callback_debug';
$oauth2_server_url      = 'https://www.facebook.com/dialog/oauth';
$oauth2_scope           = 'public_profile';
$oauth2_response_type   = 'code';
$oauth2_tokenurl        = 'https://graph.facebook.com/oauth/access_token';
$oauth2_grant_type      = 'authorization_code';
$oauth2_user_id_url     = 'https://graph.connect.facebook.com/me?access_token={ACCESS_TOKEN}';

function get_picture_url($r) {
    $id = $r->id;
    $p = get("https://graph.facebook.com/$id?fields=picture.type(square)");
    return $p->picture->data->url;
}
?>