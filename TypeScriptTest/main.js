
window.onload = function () {
    var el = document.getElementById('content');
    var canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    el.appendChild(canvas);
    var context = canvas.getContext('2d');
    context.fillStyle = 'red';
    context.fillRect(10, 10, 100, 100);
};
