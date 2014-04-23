var LoginScreen = (function () {
    "use strict";

    return chs.Class({
        inherit$: [chs.Drawable],

        $: function (loader, mainMenu) {
            var consolasItalic = chs.Font.load("Consolas_Italic", loader);
            chs.Drawable.call(this);
            this.mainMenu = mainMenu;
            this.dimensions = { width: 800, height: 600 };
            this.addChild(new chs.Menu(400, 300, consolasItalic, [
                '<Login with Google',
                '<Login with Facebook',
                '<Login with Microsoft',
                '<Login with Twitter'
            ], [this.loginGoogle], this).setPivot(0.5, 0.5));
        },

        loginGoogle: function () {
            window.location = 'http://www.make-the-words.com/logingoogle.php';
        }
    });
}());