var Dictionary = (function () {

    var dictionary = null;

    return {

        init: function (dict) {
            dictionary = dict;
        },

        isWord: function (str) {
            return dictionary.words.hasOwnProperty(str);
        },

        getDefinition: function (str) {
            return Dictionary.isWord(str) ? dictionary.words[str] : "??";
        }
    }

}());