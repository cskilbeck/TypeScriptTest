<?php
session_start();
function full_path()
{
    $s = &$_SERVER;
    $ssl = (!empty($s['HTTPS']) && $s['HTTPS'] == 'on') ? true:false;
    $sp = strtolower($s['SERVER_PROTOCOL']);
    $protocol = substr($sp, 0, strpos($sp, '/')) . (($ssl) ? 's' : '');
    $port = $s['SERVER_PORT'];
    $port = ((!$ssl && $port=='80') || ($ssl && $port=='443')) ? '' : ':'.$port;
    $host = isset($s['HTTP_X_FORWARDED_HOST']) ? $s['HTTP_X_FORWARDED_HOST'] : (isset($s['HTTP_HOST']) ? $s['HTTP_HOST'] : null);
    $host = isset($host) ? $host : $s['SERVER_NAME'] . $port;
    $uri = $protocol . '://' . $host . $s['REQUEST_URI'];
    $segments = explode('?', $uri, 2);
    $url = $segments[0];
    return $url;
}

$full_url = full_path();
$url_parts = parse_url($full_url);
$path_parts = pathinfo($url_parts["path"]);
$host = $url_parts["scheme"]."://".$url_parts["host"];
$path = $path_parts["dirname"];
$path = rtrim($path, "/");
$extension = empty($path_parts["extension"]) ? "" : ".".$path_parts["extension"];
$script_name = empty($path_parts["filename"]) ? "" : "/".$path_parts["filename"].$extension;
$url_root = $host.$path.$script_name;
$_SESSION["URL"] = $url_root;
?>