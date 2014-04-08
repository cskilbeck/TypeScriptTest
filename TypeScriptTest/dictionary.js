var Dictionary = (function () {

    var dictionary = null;

    return {

        load: function (loader) {
            dictionary = loader.load("dictionary.json");
        },

        isWord: function (str) {
            return dictionary.words.hasOwnProperty(str);
        },

        getDefinition: function (str) {
            return Dictionary.isWord(str) ? dictionary.words[str] : "??";
        }
    }

}());