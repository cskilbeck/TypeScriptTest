/////////////////////////////////////////////////////////////////////

var test = glib.Class({ inherit$: glib.SolidRectangle,

    $: function(x, y, w, h, radius, fillColour) {
        glib.SolidRectangle.call(this, x, y, w, h, radius, fillColour);
    },

    onUpdate: function(time, deltaTime) {
        glib.Debug.text(100, 100, "Hello" + deltaTime.toString());
        this.x += 1;
    }

});


window.onload = function () {
    "use strict";

    /////////////////////////////////////////////////////////////////////

    function onResize() {
        document.body.style.width = window.innerWidth + "px";
        document.body.style.height = window.innerHeight + "px";
    }

    /////////////////////////////////////////////////////////////////////

    document.body.style.position = "absolute";
    document.body.style.margin = "0px";
    document.body.style.padding = "0px";
    document.body.style.left = "0px";
    document.body.style.top = "0px";

    window.addEventListener("resize", onResize, false);
    onResize();

    new glib.Playfield({
        width: 852,
        height: 480,
        backgroundColour: "rgb(16, 72, 16)",
        autoCenter: true,
        DOMContainer: document.body
    }).addChild(new mtw.MainMenu());
};
