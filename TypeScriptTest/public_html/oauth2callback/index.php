<?php

session_start();

require('../google.php');
require('../HttpPost.class.php');

if(isset($_GET['code'])) {

    // get an access token

    $code = $_GET['code'];
    $params = array(
        "code" => $code,
        "client_id" => $oauth2_client_id,
        "client_secret" => $oauth2_secret,
        "redirect_uri" => $oauth2_redirect,
        "grant_type" => $oauth2_grant_type
    );
    $request = new HttpPost($oauth2_tokenurl);
    $request->setPostData($params);
    $request->send();
    $r = json_decode($request->getHttpResponse());

    // get the userinfo

    $url = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' . $r->access_token;
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
        $_SESSION['message'] = $r->message;
    }

    // create a session

	  $ws = "http://ec2-75-101-200-254.compute-1.amazonaws.com/mtw?action=login";
    $request = new HttpPost($ws);
    $params = array(
          "oauth_provider" => "1",
          "oauth_sub" => $r->id,
          "oauth_name" => $r->name,
          "oauth_first_name" => $r->given_name,
          "oauth_last_name" => $r->family_name,
          "oauth_picture" => $r->picture,
          "oauth_link" => $r->link
    );
    $request->setPostData($params);
    $request->send();
    $response = $request->getHttpResponse();
    $r = json_decode($response);

    // set the session cookie and go back to the app

    setcookie('session', $r->session,  mktime(). time()+60*60*24*30);

    header('Location: http://www.make-the-words.com');
}
?>