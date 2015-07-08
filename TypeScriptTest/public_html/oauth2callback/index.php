<?
session_start();
require('webservice.php');
require('../php/HttpPost.class.php');
do_redirect('../php/cb', $_SESSION["URL"]);
?>
