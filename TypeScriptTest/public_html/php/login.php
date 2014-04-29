<?
session_start();
require('HttpPost.class.php');
// if no session in progress
if(!isset($_COOKIE['session_token'])) {
    // if provider known
    if(isset($_COOKIE['provider_id'])) {
        // then login with relevant provider
        switch($_COOKIE['provider_id']) {
            case '1':
                require('google.php');
                $_SESSION['oauth_state'] = md5(rand());
                $query_params = array(
                            'response_type' => $oauth2_response_type,
                            'client_id' => $oauth2_client_id,
                            'redirect_uri' => $oauth2_redirect,
                            'scope' => $oauth2_scope,
                            'state' => $_SESSION['oauth_state']
                            );
                header("Location: " . $oauth2_server_url. '?' . http_build_query($query_params));
                break;
            case '2': header("blah.php");
                break;
            default:
                echo("Provider ID is" . $_COOKIE['provider_id']);
        }
    } else {
        echo ("No provider ID set... that's weird");
    }
}
?>
