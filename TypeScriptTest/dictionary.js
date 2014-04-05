var Dictionary = (function () {

    var dictionary = null;

    ajax.get("img/Dictionary.js", {}, function (data) {
        dictionary = JSON.parse(data);
    }, this);

    return {

        isLoaded: function(str) {
            return dictionary !== null;
        },

        isWord: function (str) {
            return isLoaded() ? dictionary.hasOwnProperty(str) : false;
        },

        getDefinition: function (str) {
            return isWord(str) ? dictionary[str];
        }
    }

}());