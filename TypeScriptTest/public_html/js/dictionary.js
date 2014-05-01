//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    var dictionary = null;

    mtw.Dictionary = {

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
            return mtw.Dictionary.isWord(str) ? dictionary.words[str] : "";
        }
    };

}());