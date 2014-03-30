//////////////////////////////////////////////////////////////////////

"use strict"

//////////////////////////////////////////////////////////////////////

var Game = (function () {

    var currentTime = window.performance.now();
    var deltaTime = 0;
    var frames = 0;
    var board;
    var canvas;
    var context;

    var Game = function (canvasName, screenDivName) {
        Mouse.init(canvasName, screenDivName);
        Keyboard.init();
        canvas = document.getElementById(canvasName);
        context = canvas.getContext('2d');
        board = new Board();
    };

    Game.prototype = {

        run: function () {
            var now = window.performance.now();
            deltaTime = now - currentTime;
            currentTime = now;
            Keyboard.update();
            Mouse.update();
            context.fillStyle = 'white';
            context.fillRect(0, 0, 800, 600);
            context.globalCompositeOperation = 'source-over';
            context.globalAlpha = 1;
            board.draw(context);
            frames += 1;
            requestAnimFrame(this.run);
       }
    };

    return Game;

})();

//////////////////////////////////////////////////////////////////////

window.onload = function () {
    new Game('myCanvas', 'screen').run();
};
