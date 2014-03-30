//////////////////////////////////////////////////////////////////////

/*global Keyboard, Mouse, Board, document, window, requestAnimFrame, console, Font, Fixedsys */

//////////////////////////////////////////////////////////////////////

var fixedSys = new Font(Fixedsys);

var Game = (function () {

    "use strict";

    var currentTime = window.performance.now(),
        deltaTime = 0,
        frames = 0,
        board,
        canvas,
        context,

        Game = function (canvasName, screenDivName) {
            Mouse.init(canvasName, screenDivName);
            Keyboard.init();
            canvas = document.getElementById(canvasName);
            context = canvas.getContext('2d');
            board = new Board();
        };

    function doFrame() {
        var now = window.performance.now();
        deltaTime = now - currentTime;
        currentTime = now;
        Keyboard.update();
        Mouse.update();

        context.fillStyle = 'darkGrey';
        context.fillRect(0, 0, 800, 600);

        fixedSys.drawText(context, 700, 20, "Frames: " + frames.toString());

        context.globalCompositeOperation = 'source-over';
        context.globalAlpha = 1;
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
