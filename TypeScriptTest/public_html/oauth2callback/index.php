<?
session_start();

require('../php/HttpPost.class.php');

setcookie("t0", "N", time() + 999999, '/');

if(isset($_GET['code']) && isset($_COOKIE['provider_id'])) {

    $provider = $_COOKIE['provider_id'];
    $var_file = '../php/cb' . $provider . '.php';
    if (file_exists($var_file)) {

        require($var_file);

        // get an access token
        $p = array(
            "client_id" => $oauth2_client_id,
            "client_secret" => $oauth2_secret,
            "code" => $_GET['code'],
            "grant_type" => $oauth2_grant_type,
            "redirect_uri" => $oauth2_redirect2
        );

        $t = post($oauth2_tokenurl, $p);

        setcookie("t1", "N", time() + 999999, '/');

        if(!isset($t->access_token)) {
            var_dump($t);
            setcookie('provider_id', null, time() - 3600, '/');
            setcookie('login_error', "Couldn't get access token", 0, '/');
        } else {

            setcookie("t2", "N", time() + 999999, '/');

            // get the userinfo
            $r = get(str_replace("{ACCESS_TOKEN}", $t->access_token, $oauth2_user_id_url), null);

            if(!isset($r->error)) {

                setcookie("t3", "N", time() + 999999, '/');

                $id = $r->id;
                $name = $r->name;
                $pic = get_picture_url($r);

                // got userinfo, register a session with the web service
                $params = array(
                    "oauth_provider" => $oauth2_provider_id,
                    "oauth_sub" => $id,
                    "name" => $name,
                    "picture" => $pic
                );

                // if anon_user_id is set, convert that user...
                if(isset($_COOKIE['anon_user_id'])) {
                    $params['anon_user_id'] = $_COOKIE['anon_user_id'];
                    setcookie('anon_user_id', null, time() - 3600, '/');
                    unset($_COOKIE['anon_user_id']);
                }

                setcookie("t4", "N", time() + 999999, '/');

                $u = servicepost('login', $params);

                // set the session cookie and go back to the app
                if(!isset($u->error)) {
                    setcookie('session_id', $u->session_id, time() + 60 * 60 * 24 * 30, '/');
                } else {
                    setcookie('login_error', urldecode($u->error), 0, '/');
                }
            } else {
                setcookie('login_error', urldecode($r->message), 0, '/');
            }
        }
    } else {
        setcookie('login_error', 'Bad provider_id', 0, '/');
    }
} else if(isset($_GET['error'])) {
    setcookie('login_error', urldecode($_GET['error']), 0, '/');
}
header('Location: http://make-the-words.com');
?>
