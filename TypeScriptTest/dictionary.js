var Dictionary = (function () {

    var dictionary = null;

    return {

        load: function (loader) {
            dictionary = loader.JSON("dictionary");
        },

        isWord: function (str) {
            return dictionary.hasOwnProperty(str);
        },

        getDefinition: function (str) {
            return Dictionary.isWord(str) ? dictionary[str] : "??";
        }
    }

}());