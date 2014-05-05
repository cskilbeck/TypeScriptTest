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
		curl_setopt( $this->ch, CURLOPT_FOLLOWLOCATION, true );
		curl_setopt( $this->ch, CURLOPT_RETURNTRANSFER, true );
        curl_setopt( $this->ch, CURLINFO_HEADER_OUT, true);
		curl_setopt( $this->ch, CURLOPT_HTTPHEADER, array("Origin: $host", "HTTP_ORIGIN: $host" ));
	}

	public function __destruct() {
		curl_close($this->ch);
	}

    public function clearPostData() {
        cur_setopt( $this->ch, CURLOPT_POST, false);
    }

	public function setPostData( $params ) {
		$this->postString = rawurldecode(http_build_query( $params ));
		curl_setopt( $this->ch, CURLOPT_POST, true );
		curl_setopt ( $this->ch, CURLOPT_POSTFIELDS, $this->postString );
	}

	public function send() {
		$this->httpResponse = curl_exec( $this->ch );
	}

	public function getHttpResponse() {
		return $this->httpResponse;
	}
}

function call($url, $params) {
    $request = new HttpPost($url);
    if(!is_null($params)) {
        $request->setPostData($params);
    }
    $request->send();
    return json_decode($request->getHttpResponse());
}

function servicecall($action, $params) {
    return call("http://ec2-75-101-200-254.compute-1.amazonaws.com/mtw?&action=" . $action, $params);
}
?>