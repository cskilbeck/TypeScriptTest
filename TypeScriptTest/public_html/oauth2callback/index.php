<<<<<<< HEAD
<?
// oauth2callback/index.php
=======
<?php
>>>>>>> FETCH_HEAD

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
        "grant_type" => "authorization_code"
    );

    // build a new HTTP POST request
    $request = new HttpPost($url);
    $request->setPostData($params);
    $request->send();

    // decode the incoming string as JSON
    $responseObj = json_decode($request->getHttpResponse());

    // get the userinfo
    $url = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' . $responseObj->access_token;
    $request = new HttpPost($url);
    $request->send();
    $response = $request->getHttpResponse();
    $r = json_decode($response);
    $_SESSION['id'] = $r->id;
    $_SESSION['name'] = $r->name;
    header('Location: http://www.make-the-words.com');

    // get the userinfo
    $r = call('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' . $r->access_token, NULL);

    if(!isset($r->error)) {

        $params = array(
              "oauth_provider" => $oauth2_provider_id,
              "oauth_sub" => $r->id,
              "name" => $r->name,
              "picture" => $r->picture
        );

        // if user_id is set, convert that user...
        if(isset($_COOKIE['anon_user_id'])) {
            $params['anon_user_id'] = $_COOKIE['anon_user_id'];
            setcookie('anon_user_id', null, time() - 3600, '/');
            unset($_COOKIE['anon_user_id']);
        }

        $u = servicecall('login', $params);

        // set the session cookie and go back to the app
        if(!isset($u->error)) {
            setcookie('provider_id', $oauth2_provider_id, time() + 60 * 60 * 24 * 365, '/');
            setcookie('session_id', $u->session_id, time() + 60 * 60 * 24 * 30, '/');
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
>>>>>>> FETCH_HEAD
