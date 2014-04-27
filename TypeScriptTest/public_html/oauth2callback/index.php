<?php // oauth2callback/index.php

session_start();

require('../config.php');
require('../HttpPost.class.php');

if(isset($_GET['code'])) {

    // try to get an access token
    $code = $_GET['code'];
    $url = 'https://accounts.google.com/o/oauth2/tokenKKK';

    // this will be our POST data to send back to the OAuth server in exchange for an access token
    $params = array(
        "code" => $code,
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

    // get the userinfo from OP
    $url = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' . $responseObj->access_token;
    $request = new HttpPost($url);
    $request->send();
    $response = $request->getHttpResponse();
    $r = json_decode($response);
    if(!isset($r->error)) {
        $_SESSION['id'] = $r->id;
        $_SESSION['name'] = $r->name;
        $_SESSION['firstName'] = $r->given_name;
        $_SESSION['lastName'] = $r->family_name;
        $_SESSION['picture'] = $r->picture;
        $_SESSION['link'] = $r->link;
    } else {
        $_SESSION['error'] = "Login failed";
    }

	// now register the user with my web service

    header('Location: http://www.make-the-words.com');
}
?>