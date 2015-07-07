<?php
function get_protocol() {
    if (isset($_SERVER['HTTPS'])) {
        if ($_SERVER['HTTPS'] == 1) {
            return "HTTPS://";
        } elseif ($_SERVER['HTTPS'] == 'on') {
            return "HTTPS://";
        }
    } elseif ($_SERVER['SERVER_PORT'] == 443) {
        return "HTTPS://";
    }
    return "HTTP://";
}

class HttpPost {

	public $url;
	public $postString;
	public $httpResponse;
	public $ch;

	public function __construct($url) {
		$this->url = $url;
		$this->ch = curl_init( $this->url );
        $host = get_protocol() . $_SERVER['HTTP_HOST'];
        curl_setopt( $this->ch, CURLOPT_POST, false);
		curl_setopt( $this->ch, CURLOPT_FOLLOWLOCATION, true );
		curl_setopt( $this->ch, CURLOPT_RETURNTRANSFER, true );
        curl_setopt( $this->ch, CURLINFO_HEADER_OUT, true);
        curl_setopt( $this->ch, CURLOPT_VERBOSE, 1 );
        curl_setopt( $this->ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt( $this->ch, CURLOPT_SSL_VERIFYHOST, false);
		curl_setopt( $this->ch, CURLOPT_HTTPHEADER, array("Origin: $host", "HTTP_ORIGIN: $host" ));
	}

	public function __destruct() {
		curl_close($this->ch);
	}

    public function clearPostData() {
        curl_setopt( $this->ch, CURLOPT_POST, false);
    }

	public function setPostData( $params ) {
		$this->postString = rawurldecode(http_build_query( $params ));
		curl_setopt( $this->ch, CURLOPT_POST, true );
		curl_setopt( $this->ch, CURLOPT_POSTFIELDS, $this->postString );
	}

	public function send() {
        $this->httpResponse = curl_exec($this->ch);
        return $this->httpResponse;
	}

	public function getHttpResponse() {
		return $this->httpResponse;
	}
}

function gecho($text) {
    //echo($text);
}

function post($url, $params) {
    $request = new HttpPost($url);
    if(!is_null($params)) {
        $request->setPostData($params);
    }
    gecho("POST:$url<br>");
    $response = $request->send();
    gecho("RESPONSE:$response<br>");
    if($response[0] == "{") {
        return json_decode($response);
    } else {
        $result = array();
        parse_str($response, $result);
        return (object)$result;
    }
}

function get($url, $params = null) {
    $p = "";
    if(!is_null($params)) {
        $p = "?".http_build_query($params);
    }
    return post($url.$p, null);
}

function serviceget($action, $params) {
    $p = "";
    if(!is_null($params)) {
        $p = "&".http_build_query($params);
    }
    global $webservice;
    gecho("WEBSERVICE: $webservice<br>");
    return post($webservice.$action.$p, null);
}

function servicepost($action, $params) {
    global $webservice;
    gecho("WEBSERVICE: $webservice<br>");
    return post($webservice.$action, $params);
}

function debug_message($text) {
    gecho("$text<br>");
    return servicepost('message', array("text" => $text));
}

function do_redirect($varfile, $location)
{
    debug_message("DO_REDIRECT begins...");
    if(isset($_GET['code']) && isset($_COOKIE['provider_id'])) {

        $provider = $_COOKIE['provider_id'];
        $var_file = $varfile . $provider . '.php';

        debug_message("Provider: $provider, VarFile: $var_file");

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

            debug_message("Client ID: $oauth2_client_id, redirect_uri: $oauth2_redirect2");

            $t = post($oauth2_tokenurl, $p);

            if(!isset($t->access_token)) {

                $err = $t->error;

                debug_message("Login error: $err");

                setcookie('provider_id', null, time() - 3600, '/');
                setcookie('login_error', "No token ($t->error)" . $oauth2_redirect2, 0, '/');
            } else {

                // get the userinfo
                $r = get(str_replace("{ACCESS_TOKEN}", $t->access_token, $oauth2_user_id_url), null);

                if(!isset($r->error)) {

                    $id = $r->id;
                    $name = $r->name;
                    $pic = get_picture_url($r);

                    debug_message("ID: $id, NAME: $name");

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
    header('Location: ' . $location);
}
?>