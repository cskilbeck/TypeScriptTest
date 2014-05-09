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

function post($url, $params) {
    $request = new HttpPost($url);
    if(!is_null($params)) {
        $request->setPostData($params);
    }
    $response = $request->send();
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
    $webservice = "http://ec2-75-101-200-254.compute-1.amazonaws.com/mtw?action=";
    $p = "";
    if(!is_null($params)) {
        $p = "&".http_build_query($params);
    }
    return post($webservice.$action.$p, null);
}

function servicepost($action, $params) {
    $webservice = "http://ec2-75-101-200-254.compute-1.amazonaws.com/mtw?action=";
    return post($webservice.$action, $params);
}
?>