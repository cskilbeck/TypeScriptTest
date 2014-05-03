(function () {
    "use strict";

    var net = require('net'),
        s = new net.Socket(),
        port = parseInt(process.argv[2], 10),
        arg = process.argv[3];

    s.on("data", function (data) {
        console.log("Answer: " + data.toString());
        process.exit();
    });

    console.log("Connecting to port " + port.toString());
    s.connect(port, '127.0.0.1');
    console.log("Writing: [" + arg + "]");
    s.write(process.argv[3]);

}());

