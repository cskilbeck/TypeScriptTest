<<<<<<< HEAD
<? session_start(); ?>
=======
<?
session_start();
require('php/HttpPost.class.php');
if(!isset($_COOKIE['session_id']) && isset($_COOKIE['provider_id'])) {
    switch($_COOKIE['provider_id']) {
        case '1':
            require('php/google.php');
            $query_params = array(
                        'response_type' => $oauth2_response_type,
                        'client_id' => $oauth2_client_id,
                        'redirect_uri' => $oauth2_redirect,
                        'scope' => $oauth2_scope
                        );
            header("Location: " . $oauth2_server_url. '?' . http_build_query($query_params));
            echo("redirect to " . $oauth2_server_url. '?' . http_build_query($query_params));
            break;
        case '2': header("blah.php");
            break;
        default:
            echo("Provider ID is" . $_COOKIE['provider_id']);
    }
}
?>
>>>>>>> FETCH_HEAD
<!DOCTYPE html>

<html>

<head>
    <meta charset="utf-8" />
    <title>Make The Words</title>
    <link rel="stylesheet" href="app.css" type="text/css" />
<<<<<<< HEAD
    <script>
    mtw = {
        User: {
<?
    if(isset($_SESSION['id']) && isset($_SESSION['name'])) {
        echo "        id: " . $_SESSION['id'] . ",
";
        echo "        name: " . $_SESSION['name'] . "
";
    }
?>
        }
    }
    </script>
    <script src="polyfill.js"></script>
    <script src="chs.js"></script>
    <script src="util.js"></script>
    <script src="event.js"></script>
    <script src="random.js"></script>
    <script src="cookies.js"></script>
    <script src="ajax.js"></script>
    <script src="list.js"></script>
    <script src="timer.js"></script>
    <script src="matrix.js"></script>
    <script src="drawable.js"></script>
    <script src="loader.js"></script>
    <script src="sprite.js"></script>
    <script src="button.js"></script>
    <script src="panel.js"></script>
    <script src="label.js"></script>
    <script src="font.js"></script>
    <script src="textbutton.js"></script>
    <script src="spritebutton.js"></script>
    <script src="menu.js"></script>
    <script src="window.js"></script>
    <script src="messagebox.js"></script>
    <script src="keyboard.js"></script>
    <script src="mouse.js"></script>
    <script src="debug.js"></script>
    <script src="dictionary.js"></script>
    <script src="word.js"></script>
    <script src="tile.js"></script>
    <script src="board.js"></script>
    <script src="game.js"></script>
    <script src="loginscreen.js"></script>
    <script src="mainmenu.js"></script>
    <script src="startup.js"></script>
    <script src="main.js"></script>
=======

    <!--[if gte IE 9]><!-->
    <script src="js/chs.js"></script>
    <script src="js/browser.js"></script>
    <script src="js/class.js"></script>
    <script src="js/user.js"></script>
    <script src="js/polyfill.js"></script>
    <script src="js/util.js"></script>
    <script src="js/event.js"></script>
    <script src="js/random.js"></script>
    <script src="js/cookies.js"></script>
    <script src="js/ajax.js"></script>
    <script src="js/webservice.js"></script>
    <script src="js/list.js"></script>
    <script src="js/timer.js"></script>
    <script src="js/matrix.js"></script>
    <script src="js/drawable.js"></script>
    <script src="js/loader.js"></script>
    <script src="js/sprite.js"></script>
    <script src="js/button.js"></script>
    <script src="js/panel.js"></script>
    <script src="js/label.js"></script>
    <script src="js/font.js"></script>
    <script src="js/textbutton.js"></script>
    <script src="js/spritebutton.js"></script>
    <script src="js/menu.js"></script>
    <script src="js/window.js"></script>
    <script src="js/messagebox.js"></script>
    <script src="js/keyboard.js"></script>
    <script src="js/mouse.js"></script>
    <script src="js/debug.js"></script>
    <script src="js/dictionary.js"></script>
    <script src="js/letters.js"></script>
    <script src="js/word.js"></script>
    <script src="js/tile.js"></script>
    <script src="js/board.js"></script>
    <script src="js/boardtile.js"></script>
    <script src="js/boardgame.js"></script>
    <script src="js/game.js"></script>
    <script src="js/loginscreen.js"></script>
    <script src="js/mainmenu.js"></script>
    <script src="js/main.js"></script>
    <script src="js/startup.js"></script>
    <!--<![endif]-->
>>>>>>> FETCH_HEAD
</head>

<body id="screen">

    <!--[if lt IE 9]>
    <div id="message">
        <h3>
            <p>Sorry, this version of Internet Explorer isn't supported.</p>
        </h3>
        <p>These new ones all seem to work:</p>
        <div>
            <a href="http://windows.microsoft.com/en-us/internet-explorer/download-ie">
                <img class='smalllogo' src="http://res1.windows.microsoft.com/resbox/en/internet explorer/main/51eae848-5a97-4216-a941-d6af8e941b07_5.png"/>
            </a>
        </div>
        <div>
            <a href="http://www.google.com/intl/en_us/chrome/browser/">
                <img class='logo' src="http://www.google.com/intl/en/chrome/assets/common/images/chrome_logo_2x.png"/>
            </a>
        </div>
        <div>
            <a href="http://www.mozilla.org/en-US/firefox/new/">
                <img class='logo' src="http://mozorg.cdn.mozilla.net/media/img/firefox/new/header-firefox.png?2013-06"/>
            </a>
        </div>
    </div>
    <![endif]-->

    <!--[if gte IE 9]><!-->
    <canvas id="myCanvas" width="1000" height="600"></canvas>
    <!--<![endif]-->

</body>
<<<<<<< HEAD
=======

>>>>>>> FETCH_HEAD
</html>
