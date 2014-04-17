//////////////////////////////////////////////////////////////////////

var Dictionary = (function () {
    "use strict";

    //////////////////////////////////////////////////////////////////////

    var dictionary = null;

    return {

        init: function (dict) {
            dictionary = dict;
        },

        words: function () {
            return dictionary.words;
        },

        isWord: function (str) {
            return dictionary.words.hasOwnProperty(str);
        },

        getDefinition: function (str) {
            return Dictionary.isWord(str) ? dictionary.words[str] : "??";
        }
    }

}());