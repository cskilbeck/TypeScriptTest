//////////////////////////////////////////////////////////////////////

var Screen = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var screens = new LinkedList('screenListNode'),

        Screen = function () {
            this.screenListNode = listNode(this);
            this.zIndex = 0;
            this.exit = false;
            screens.add(this);
        };

    //////////////////////////////////////////////////////////////////////
    // return one of these from onUpdate to influence what screens below
    // you in the stack get:

    Screen.halt = 1;    // screens below you get no processing at all
    Screen.modal = 2;   // screens below you get processing but no input
    
    //////////////////////////////////////////////////////////////////////

    Screen.updateAll = function (deltaTime) {
        screens.removeIf(function (s) {
            if (s.exit) {
                s.onClose();
                return true;
            }
            return false;
        });
        screens.sort(function (s) {
            return s.zIndex;
        });
        screens.forEach(function (s) {
            switch (s.onUpdate(deltaTime)) {
            case Screen.halt:
                return false;
            case Screen.modal:
                Mouse.freeze();
                Keyboard.freeze();
                return true;
            default:
                return true;
            }
            Mouse.unfreeze();
            Keyboard.unfreeze();
        });
    };

    //////////////////////////////////////////////////////////////////////

    Screen.drawAll = function (context) {
        screens.forEach(function (s) {
            s.draw(context);
        });
    };

    //////////////////////////////////////////////////////////////////////

    Screen.prototype = {

        close: function () {
            this.exit = true;
        },

        // return undefined or Screen.halt or Screen.modal
        onUpdate: function () {
            return;
        },

        // return value is ignored
        onDraw: function (context) {
            return;
        },

        // someone called close(), the screen manager has got around
        // to closing the screen
        onClose: function () {
            return;
        }

    };

    //////////////////////////////////////////////////////////////////////

    return Screen;
}());

//////////////////////////////////////////////////////////////////////
