
GLOBAL.chs = {};    // global namespaces
GLOBAL.mtw = {};

var net = require('net');

var dictionary = require('./dictionary.json');

require('./js/class.js');
require('./js/list.js');
require('./js/random.js');
require('./js/letters.js');
require('./js/word.js');
require('./js/dictionary.js');
require('./js/tile.js');
require('./js/board.js');

mtw.Dictionary.init(dictionary);

var queryStringToJSON = function (url) {
    "use strict";

    var result = {},
        pairs,
        idx,
        pair;
    if (url) {
        pairs = url.split('&');
        for (idx in pairs) {
            pair = pairs[idx];
            if (pair.indexOf('=') !== -1) {
                pair = pair.split('=');
                if (!!pair[0]) {
                    result[pair[0].toLowerCase()] = decodeURIComponent(pair[1] || '');
                } else {
                    result[pair.toLowerCase()] = true;
                }
            }
        }
    }
    return result;
};

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

        var params = queryStringToJSON(data.toString()),
            board,
            checkBoard,
            trueBoard,
            output = {};

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
    });

}).listen(1338, '127.0.0.1');
