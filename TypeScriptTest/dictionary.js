var Dictionary = (function () {

    var dictionary = null;

    return {

        load: function (loader) {
            loader.loadJSON("dictionary", function (d) {
                dictionary = d;
            });
        },

        isWord: function (str) {
            return dictionary.hasOwnProperty(str);
        },

        getDefinition: function (str) {
            return Dictionary.isWord(str) ? dictionary[str] : "??";
        }
    }

}());