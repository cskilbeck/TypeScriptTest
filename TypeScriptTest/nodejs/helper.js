var dictionary = require('./dictionary.json');

require('./js/chs.js');
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

net.createServer(function (socket) {
    "use strict";

    socket.on('data', function (data) {

        var params = chs.Util.queryStringToJSON(data.toString()),
            board,
            checkBoard,
            trueBoard,
            output = {};

        if (typeof params.action === 'string') {

            switch (params.action.toLowerCase()) {

            case 'getscore':
                if (params.board !== undefined &&
                    params.seed !== undefined) {
                    board = new mtw.Board();
                    board.randomize(parseInt(params.seed, 10));
                    trueBoard = board.getAsString().split('').sort().join('');
                    checkBoard = params.board.split('').sort().join('');
                    output.valid = checkBoard.localeCompare(trueBoard) === 0;
                    if (output.valid) {
                        board.setFromString(params.board);
                        board.markAllWords();
                        output.score = board.score;
                    }
                }
                break;

            case 'getboard':
                if (params.seed !== undefined) {
                    board = new mtw.Board();
                    board.randomize(parseInt(params.seed, 10));
                    output.board = board.getAsString();
                }
                break;

            case 'getdefinition':
                if (params.word !== undefined) {
                    output.definition = mtw.Dictionary.getDefinition(params.word);
                }
                break;
            }
            socket.write(JSON.stringify(output));
        }
    });

}).listen(1338, '127.0.0.1');
