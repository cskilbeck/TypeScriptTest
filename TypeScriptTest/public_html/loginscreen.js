var LoginScreen = (function () {
    "use strict";

    function goto(x) {
        window.location = window.location.origin + "/" + x;
    }

    return chs.Class({
        inherit$: [chs.Drawable],

        $: function (loader, mainMenu) {
            var consolasItalic = chs.Font.load("Consolas_Italic", loader);
            chs.Drawable.call(this);
            this.mainMenu = mainMenu;
            this.dimensions = chs.desktop.dimensions;
            this.addChild(new chs.Menu(this.width / 2, this.height / 2, consolasItalic, [
                '<Login with Google',
                '<Login with Facebook',
                '<Login with Microsoft',
                '<Login with Twitter'
            ], [
                function () { goto('logingoogle.php'); },
                function () { goto('loginfacebook.php'); },
                function () { goto('loginmicrosoft.php'); },
                function () { goto('logintwitter.php'); }
            ], this).setPivot(0.5, 0.5));

            this.addChild(new chs.TextButton("Cancel", consolasItalic, 16, this.height - 16, 120, 36, this.close, this, 4).setPivot(0, 1));
        }
    });

}());