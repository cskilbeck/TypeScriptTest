
var currentTime = window.performance.now();
var deltaTime = 0;
var frames = 0;

var board;

function init() {
    board = new Board();
}

function drawFrame() {
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');
    context.fillStyle = 'white';
    context.fillRect(0, 0, 800, 600);
    context.globalCompositeOperation = 'source-over';
    context.globalAlpha = 1;
    board.draw(context);
}

function run() {
    var now = window.performance.now();
    deltaTime = now - currentTime;
    currentTime = now;
    Keyboard.update();
    Mouse.update();
    drawFrame(currentTime, deltaTime);
    frames += 1;
    requestAnimFrame(run);
}

window.onload = function () {
    var canvas = document.getElementById('myCanvas');
    var fontpage = ImageLoader.load("Cooper_Black_440.png");
    Mouse.init(canvas);
    Keyboard.init();
    init();
    run();
};
