
var currentTime = window.performance.now();
var deltaTime = 0;
var frames = 0;

var x = 1

var fontImages = [
    ImageLoader.load("Cooper_Black_440")
];

var font = new Font(Cooper_Black_44, fontImages);

function drawFrame() {
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');
    context.fillStyle = 'white';
    context.fillRect(0, 0, 640, 480);
    context.fillStyle = 'red';
    context.fillRect(x, 10, 100, 100);
    ++x;
    if (Keyboard.pressed('a')) {
        x = 0;
    }
    if (Mouse.left.released) {
        x = 0;
    }
    context.globalCompositeOperation = 'source-over';
    context.globalAlpha = 1;
    font.drawText(context, 100, 100, "Hello");
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
    run();
};
