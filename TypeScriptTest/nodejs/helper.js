GLOBAL.chs = {};
GLOBAL.mtw = {};

var dictionary = require('./dictionary.json');

require('./js/util.js');
require('./js/class.js');
require('./js/list.js');
require('./js/random.js');
require('./js/letters.js');
require('./js/word.js');
require('./js/dictionary.js');
require('./js/tile.js');
require('./js/board.js');

mtw.Dictionary.init(dictionary);

var net = require('net');

// Board server: 1338

// actions: getscore(board, seed): action=getscore&seed=5&board=lsdkjfklsdjflksdjflksdjflksdjflskdj
//                                  result: { 'score': 5, 'valid': true }
//          getboard(seed): action=getboard&seed=5
//                                  result: { 'board': 'sjdklhfjksdhfkjsdhfkjsdhfkj' }
//          getdefinition(word):    action=getdefinition&word=examine
//                                  result: { 'definition': 'the definition' }
//

handlers = {

    getscore: function(params) {
        var board,
            checkBoard,
            trueBoard;
        if (params.board !== undefined &&
            params.seed !== undefined) {
            board = new mtw.Board();
            board.randomize(parseInt(params.seed, 10));
            trueBoard = board.getAsString().split('').sort().join('');
            checkBoard = params.board.split('').sort().join('');
            this.valid = checkBoard.localeCompare(trueBoard) === 0;
            if (this.valid) {
                board.setFromString(params.board);
                this.score = board.markAllWords();
            }
        }
    },

    getboard: function(params) {
        if (params.seed !== undefined) {
            board = new mtw.Board();
            board.randomize(parseInt(params.seed, 10));
            this.board = board.getAsString();
        } else {
            this.error = "missing parameter: seed";
        }
    },

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

        var params = chs.Util.queryStringToJSON(data.toString()),
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
