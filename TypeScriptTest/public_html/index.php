<? session_start(); ?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Make The Words</title>
    <link rel="stylesheet" href="app.css" type="text/css" />
    <script>
    mtw = {
        User: {
<?
    if(isset($_SESSION['id']) && isset($_SESSION['name'])) {
        echo "            id: '"            . $_SESSION['id'] . "',\n";
        echo "            name: '"          . $_SESSION['name'] . "',\n";
        echo "            firstName: '"     . $_SESSION['firstName'] . "',\n";
        echo "            lastName: '"      . $_SESSION['lastName'] . "',\n";
        echo "            picture: '"       . $_SESSION['picture'] . "',\n";
        echo "            link: '"          . $_SESSION['link'] . "'\n";
    } elseif(isset($_SESSION['error'])) {
        echo "            loginError: '"    . $_SESSION['error'] . "'\n";
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
</head>
<body id="screen">
    <canvas id="myCanvas" width="800" height="600"></canvas>
</body>
</html>