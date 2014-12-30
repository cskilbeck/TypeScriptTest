#! /usr/bin/env node

console.log("Helper started at " + Date().toString());

//GLOBAL.window = GLOBAL;

var dictionary = require('./dictionary.json');

mtw = {};

require('./js/glib/global.js');
require('./js/glib/class.js');
require('./js/glib/util.js');
require('./js/glib/random.js');
require('./js/letters.js');
require('./js/board.js');
require('./js/word.js');
require('./js/dictionary.js');
require('./js/tile.js');
require('./js/board.js');

mtw.Dictionary.init(dictionary);

var net = require('net');

// daemon: 1338

// actions: getscore(board, seed): action=getscore&seed=5&board=lsdkjfklsdjflksdjflksdjflksdjflskdj
//                                  result: { 'score': 5, 'valid': true }
//          getboard(seed): action=getboard&seed=5
//                                  result: { 'board': 'sjdklhfjksdhfkjsdhfkjsdhfkj' }
//          getdefinition(word):    action=getdefinition&word=examine
//                                  result: { 'definition': 'the definition' }
//

function checkBoard(letters, seed) {
    var board = new mtw.Board(),
        check = letters.split('').sort().join('');
    board.randomize(parseInt(seed, 10));
    return  (board.getAsString().split('').sort().join('').localeCompare(check) === 0) ? board : null;
}

handlers = {

    // get the score for a board

    getscore: function(params) {
        var board;
        if (params.board !== undefined && params.seed !== undefined) {
            board = checkBoard(params.board, params.seed);
            this.valid = board !== null;
            if (this.valid) {
                board.setFromString(params.board);
                this.score = board.markAllWords();
                this.words = board.words;
            }
        } else {
            this.valid = false;
            this.error = "missing parameter";
        }
    },

    // get the board for a seed

    getboard: function(params) {
        if (params.seed !== undefined) {
            board = new mtw.Board();
            board.randomize(parseInt(params.seed, 10));
            this.board = board.getAsString();
        } else {
            this.error = "missing parameter: seed";
        }
    },

    // get the definition of a word

    definition: function(params) {
        if (params.word !== undefined) {
            if(mtw.Dictionary.isWord(params.word)) {
                this.definition = mtw.Dictionary.getDefinition(params.word);
            } else {
                this.error = "not a word: " + params.word;
            }
        } else {
            this.error = "missing parameter: word";
        }
    }
};

net.createServer(function (socket) {
    "use strict";

    socket.on('data', function (data) {

        console.log(Date().toString() + ":" + data.toString());

        var params = glib.Util.queryStringToObject(data.toString()),
            action,
            output = {};

        if (typeof params.action === 'string') {
            action = params.action.toLowerCase();
            if(action in handlers) {
                handlers[action].call(output, params);
            } else {
                output.error = "unknown action: " + action;
            }
        } else {
            output.error = "missing parameter: action";
        }
        socket.write(JSON.stringify(output));
    });

}).listen(1338, '127.0.0.1');
