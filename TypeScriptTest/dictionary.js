var Dictionary = (function () {

    var dictionary = null;

    ajax.get("img/dictionary.json", {}, function (data) { dictionary = JSON.parse(data); });

    return {

        isLoaded: function() {
            return dictionary !== null;
        },

        isWord: function (str) {
            return Dictionary.isLoaded() ? dictionary.hasOwnProperty(str) : false;
        },

        getDefinition: function (str) {
            return Dictionary.isWord(str) ? dictionary[str] : "??";
        }
    }

}());