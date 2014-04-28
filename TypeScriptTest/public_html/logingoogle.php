<?php
require('google.php');
$_SESSION['oauth_state'] = md5(rand());
$query_params = array(
           'response_type' => $oauth2_response_type,
           'client_id' => $oauth2_client_id,
           'redirect_uri' => $oauth2_redirect,
           'scope' => $oauth2_scope,
           'state' => $_SESSION['oauth_state']
           );
$forward_url = $oauth2_server_url. '?' . http_build_query($query_params);
header("Location: " . $forward_url);
?>