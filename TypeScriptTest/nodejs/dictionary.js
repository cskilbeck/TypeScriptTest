//////////////////////////////////////////////////////////////////////

// do it like this for node
var dictionary = require('./dictionary.json');

mtw.Dictionary = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    return {

        // load it with ajax and pass it in in the browser...

        //init: function (dict) {
        //    dictionary = dict;
        //},

        words: function () {
            return dictionary.words;
        },

        isWord: function (str) {
            return dictionary.words.hasOwnProperty(str);
        },

        getDefinition: function (str) {
            return mtw.Dictionary.isWord(str) ? dictionary.words[str] : "??";
        }
    };

}());