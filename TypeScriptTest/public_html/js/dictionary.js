//////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    var dictionary = null;

    mtw.Dictionary = {

        init: function (dict) {
            dictionary = dict;
        },

        isWord: function (str) {
            return dictionary.words.hasOwnProperty(str);
        },

        getDefinition: function (str) {
            return this.isWord(str) ? dictionary.words[str] : "?";
        }
    };

}());