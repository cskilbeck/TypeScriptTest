<?php
require_once('config.php');
$oauth2_server_url = 'https://accounts.google.com/o/oauth2/auth';
$query_params = array(
           'response_type' => 'code',
           'client_id' => $oauth2_client_id,
           'redirect_uri' => $oauth2_redirect,
           'scope' => 'https://www.googleapis.com/auth/userinfo.profile'
           );
$forward_url = $oauth2_server_url . '?' . http_build_query($query_params);
echo'<script>window.location="'.$forward_url.'";</script> ';
?>
