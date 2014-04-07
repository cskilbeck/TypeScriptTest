var Dictionary = (function () {

    var dictionary = null;

    return {

        load: function (loader) {
            dictionary = loader.loadJSON("dictionary");
        },

        isWord: function (str) {
            return dictionary.words.hasOwnProperty(str);
        },

        getDefinition: function (str) {
            return Dictionary.isWord(str) ? dictionary.words[str] : "??";
        }
    }

}());