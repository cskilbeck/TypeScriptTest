//////////////////////////////////////////////////////////////////////

var Game = (function () {
    "use strict";

    var currentTime = window.performance.now(),
        deltaTime = 0,
        frames = 0,
        board,
        canvas,
        context,

        Game = function (canvasName, screenDivName) {
            canvas = document.getElementById(canvasName);
            context = canvas.getContext('2d');
            Debug.context = context;
            Mouse.init(canvasName, screenDivName);
            Keyboard.init();
            board = new Board();
            board.randomize(1);
        };

    function doFrame() {

        var now = window.performance.now();
        deltaTime = now - currentTime;
        currentTime = now;

        Keyboard.update();
        Mouse.update();

        context.globalCompositeOperation = 'source-over';
        context.globalAlpha = 1;
        context.fillStyle = 'rgb(64, 128, 64)';
        context.fillRect(0, 0, 800, 600);

        Debug.text(680, 10, "Frames: " + frames.toString());
        Debug.text(680, 25, "Delta: " + deltaTime.toString());
        Debug.text(680, 40, "X: " + Mouse.x);
        Debug.text(680, 55, "Y: " + Mouse.y);

        board.update();
        board.draw(context);

        frames += 1;
        requestAnimFrame(doFrame);
    }

    Game.prototype = {
        run: function () {
            doFrame();
        }
    };

    return Game;

}());

//////////////////////////////////////////////////////////////////////

window.onload = function () {
    "use strict";

    new Game('myCanvas', 'screen').run();
};
