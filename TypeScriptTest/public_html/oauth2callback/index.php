<?php

session_start();

require('../php/google.php');
require('../php/HttpPost.class.php');

if(isset($_GET['code'])) {

    // get an access token
    $r = call($oauth2_tokenurl, array(
        "code" => $_GET['code'],
        "client_id" => $oauth2_client_id,
        "client_secret" => $oauth2_secret,
        "redirect_uri" => $oauth2_redirect,
        "grant_type" => $oauth2_grant_type
    ));

    // get the userinfo
    $r = call('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' . $r->access_token, NULL);
    
    if(!isset($r->error)) {
        $u = servicecall('login', array(
              "oauth_provider" => $oauth2_provider_id,
              "oauth_sub" => $r->id,
              "name" => $r->name,
              "picture" => $r->picture
        ));

        // set the session cookie and go back to the app
        if(!isset($u->error)) {
            setcookie('provider_id', $oauth2_provider_id, mktime().time() + 60 * 60 * 24 * 30, '/');
            setcookie('session_id', $u->session_id, 0, '/');
            setcookie('user_id', $u->user_id, 0, '/');
            setcookie('user_name', urldecode($u->user_name), 0, '/');
            setcookie('user_picture', urldecode($u->user_picture), 0, '/');
        } else {
            setcookie('login_error', urldecode($u->error), 0, '/');
        }
    } else {
        setcookie('login_error', urldecode($r->message), 0, '/');
    }
} else if(isset($_GET['error'])) {
    setcookie('login_error', urldecode($_GET['error']), 0, '/');
}
header('Location: http://make-the-words.com');
?>