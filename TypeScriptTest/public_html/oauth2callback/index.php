<?
error_reporting(E_ALL);
ini_set('display_errors', TRUE);
require('webservice.php');
require('../php/HttpPost.class.php');
do_redirect('../php/cb', $_COOKIE["URL"]);
?>