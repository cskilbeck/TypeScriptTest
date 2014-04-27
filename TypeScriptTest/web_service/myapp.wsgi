#----------------------------------------------------------------------

import datetime
import socket
import json
import MySQLdb as mdb
from contextlib import closing
import urlparse
import urllib
import urllib2
from pprint import pprint

# !NOTE! GLOBALS MUST BE READ ONLY, this runs as >1 simultaneous processes...

#----------------------------------------------------------------------

class Error:
    E_NOACTION = [1, "Action required"]
    E_BADACTION = [2, "Bad action"]
    E_DBASEBUSY = [3, "Database is busy"]
    E_GAMEENDED = [4, "Game ended"]
    E_BADGAMEID = [5, "Wrong game id"]
    E_BADINPUT = [6, "Bad input"]
    E_DBASEERROR = [7, "Database error"]
    E_BADBOARD = [8, "Malformed board"]
    E_MISSINGPARAM = [9, "Missing parameter"]
    E_NOGAME = [10,"No game!?"]
    E_NETWORKPROBLEM = [11,"Network problem"]

#----------------------------------------------------------------------

def error(output, err, extra=""):
    output.update({"error": err[0], "errorDescription": err[1] + extra})

#----------------------------------------------------------------------
# utils
#----------------------------------------------------------------------

def encoded_dict(in_dict):
    out_dict = {}
    for k, v in in_dict.iteritems():
        if isinstance(v, unicode):
            v = v.encode('utf8')
        elif isinstance(v, str):
            v.decode('utf8') # Must be encoded in UTF-8 - set the option in the database
        out_dict[k] = v
    return out_dict

#----------------------------------------------------------------------

def opendb():
    return  mdb.connect(host        = 'mtwdb.cnk16j9pzvyy.us-east-1.rds.amazonaws.com',
                        user        = 'mtwuser',
                        passwd      = 'mtwpassword',
                        db          = 'mtwdb',
                        use_unicode = True,
                        charset     = 'utf8')

#----------------------------------------------------------------------

def cursor(db):
    return db.cursor(mdb.cursors.DictCursor)

#----------------------------------------------------------------------

def getCurrentTime():
    return datetime.datetime.strftime(datetime.datetime.now(), "%Y-%m-%d %H:%M:%S.%f")

#----------------------------------------------------------------------

def seconds(td):
    return td.days * 86400 + td.seconds

#----------------------------------------------------------------------

def getDaemonResponse(input):
    try:
        with closing(socket.socket()) as s:
            s.connect(("localhost", 32768))
            s.send(input)
            result = s.recv(256)
            return result

    except socket.error, (value, message):
        print "socket error: " + message
        return None

#----------------------------------------------------------------------

def getScore(board):
    return getDaemonResponse('b' + board) if len(board) == 35 else -1

#----------------------------------------------------------------------

def getBoard(seed):
    return getDaemonResponse("s" + str(seed))

#----------------------------------------------------------------------

def getGlobal(db, name):
    try:
        with closing(cursor(db)) as cur:
            cur.execute("select `%s` from globals limit 1" % (name))
            row = cur.fetchone()
            if row:
                return row[name]
            else:
                return None
    except mdb.DatabaseError, e:
        return None

#----------------------------------------------------------------------

def getJSONURL(path):
    try:
        req = urllib2.Request(path)
        page = urllib2.urlopen(req)
        data = page.read()
        dct = json.loads(data)
        return dct
    except HTTPError, e:
        return None

#----------------------------------------------------------------------
# Handler - base for all request handlers
#----------------------------------------------------------------------

class Handler(object):

    def __init__(self, environ, db, output):
        self.environ = environ
        self.db = db
        self.output = output

    def cursor(self):
        return cursor(self.db)

    #----------------------------------------------------------------------

    def createOrUpdatePerson(self, oauth_id, oauth_sub):
        try:
            with closing(self.cursor()) as cur:
                cur.execute("select count(*) as existence from people where oauth_id=%s and oauth_sub=%s", (oauth_id, oauth_sub))
                if cur.fetchone()['existence'] == 0:
                    # new user, insert into database
                    name = getJSONURL("http://graph.facebook.com/?fields=name&id=%s" % (str(fbid)))
                    if name:
                        realName = name['name']
                        sql = "insert into people (facebook_id, name) values (%s,%s)"
                        cur.execute(sql, (fbid, realName, realName))
                else:
                    # existing user, update name
                    pass
        except mdb.DatabaseError, e:
            pass

    #----------------------------------------------------------------------

    def add(self, x):
        self.output.update(x)

    #----------------------------------------------------------------------

    def getPostData(self):
        return dict((k, v if len(v) > 1 else v[0]) for k, v in urlparse.parse_qs(self.environ['wsgi.input'].read(), True).iteritems())

#----------------------------------------------------------------------
# action:quit
#
# parameters:   none
#
# response:     bye             string      // bye
#----------------------------------------------------------------------

class quitHandler(Handler):

    def handle(self):
        self.add({"bye": "bye"})

#----------------------------------------------------------------------
# action:ping
#
# parameters:   none
#
# response:     pong            datetime        // server time
#----------------------------------------------------------------------

class pingHandler(Handler):

    def handle(self):
        self.add({"pong": getCurrentTime()})

#----------------------------------------------------------------------
# action:oauthlist
#
# parameters:   none
#
# response:     id              int
#               name            int
#               logo            url
#----------------------------------------------------------------------

class oauthlistHandler(Handler):

    def handle(self):
        try:
            with closing(self.cursor()) as cur:
                cur.execute("select * from oauth_providers where oauth_id > 0")
                providers = []
                rows = cur.fetchall()
                for row in rows:
                    providers.append(row)
                self.add({"providers": providers})
        except mdb.DatabaseError, e:
            pprint(e)

#----------------------------------------------------------------------
# action:bot
#
# parameters:   none
#
# response:     facebook_id     int         // some facebook_id for testing bots
#               name            str
#----------------------------------------------------------------------

class botHandler(Handler):

    def handle(self):
        try:
            friendID = int(getDaemonResponse('f'))
            with closing(self.cursor()) as cur:
                # count the bots
                cur.execute("select count(*) as bot_count from people where facebook_id < 0")
                row = cur.fetchone()
                bot_count = row['bot_count']

                # decide which one to use
                cur.execute("lock table globals write")
                cur.execute("update globals set next_bot = mod(next_bot + 1, %s)", (bot_count))
                cur.execute("select next_bot from globals")
                next_bot = cur.fetchone()["next_bot"]
                cur.execute("unlock tables")

                # get it
                cur.execute("select * from people where facebook_id = %s", (-1 - next_bot))
                row = cur.fetchone()

                self.add(row)
        except mdb.DatabaseError, e:
            pprint(e)
            pass

#----------------------------------------------------------------------
# action:friend
#
# parameters:   none
#
# response:     facebook_id     int         // some facebook_id for testing bots
#----------------------------------------------------------------------

class friendHandler(Handler):

    def handle(self):
        try:
            friendID = int(getDaemonResponse('f'))
            with closing(self.cursor()) as cur:
                cur.execute("select friends.facebook_id from friends where friend_id = %s", (friendID))
                row = cur.fetchone()
                self.add(row)
        except mdb.DatabaseError, e:
            pass

#----------------------------------------------------------------------
# action:players
#
# parameters:   none
#
# response:     player_count    int
#----------------------------------------------------------------------

class playersHandler(Handler):

    def handle(self):
        with closing(self.cursor()) as cur:
            sql = "select count(*) as player_count from boards where game_id = (select game_id from games order by game_id desc limit 1)"
            cur.execute(sql)
            self.add(cur.fetchone())

#----------------------------------------------------------------------
# action:register
#
# parameters:   facebook_id     uint64      // facebook_id
#
# response:     name            str         // facebook name
#----------------------------------------------------------------------

class registerHandler(Handler):

    def handle(self):
        try:
            postData = self.getPostData()
            fbid = int(postData['facebook_id'])
            if fbid > 0:
                name = getJSONURL("http://graph.facebook.com/?fields=name&id=%s" % (str(fbid)))['name']
                with closing(self.cursor()) as cur:
                    sql = "insert into people (facebook_id, name, first_seen, last_seen) values (%s,%s,%s,%s) on duplicate key update name=%s, last_seen=%s"
                    now = datetime.datetime.now()
                    cur.execute(sql, (fbid, name, now, now, name, now))
                    self.add({ "name": name })
        except ValueError, e:
            error(self.output, Error.E_BADINPUT)
        except mdb.DatabaseError, e:
            error(self.output, Error.E_DBASEERROR)
        except KeyError, e:
            error(self.output, Error.E_MISSINGPARAM)

#----------------------------------------------------------------------
# action:game
#
# parameters:   facebook_id     uint64      // facebook_id OR
#               game_id         uint64      // game_id
#
# response:     game_id         int         // current game_id
#               random_seed     int         // random seed for current game
#               start_time      datetime    // start time for this game
#               end_time        datetime    // end time for this game
#               current_time    datetime    // current server time
#               board           str         // board for this game
#               board_id        int         // current board entry or 0 if they haven't played this game yet
#----------------------------------------------------------------------

class gameHandler(Handler):

    def handle(self):
        postData = self.getPostData()
        if postData.has_key('facebook_id'):
            facebookID = int(postData["facebook_id"])
            game = self.getCurrentGame()
            if game:
                self.add({"board_id": self.getBoardID(facebookID, int(game["game_id"]))})
                self.add(game)
            else:
                error(self.output, Error.E_NOGAME)
        elif postData.has_key('game_id'):
            gameID = int(postData['game_id'])
            game = self.getSpecificGame(gameID)
            if game:
                self.add(game)
            else:
                error(self.output, Error.E_NOGAME, ":" + str(gameID))
        else:
            error(self.output, Error.E_BADINPUT)

#----------------------------------------------------------------------
# action:getLeaderboard
#
# parameters:   game_id         int
#               board_id        optional int        either specify this or the next parameter
#               offset          optional int        if this exists, use it, else centre on the boardid
#
# response:     offset          int                 offset, total_rows only returned if boardid specified
#               total_rows      int
#               rows            int                 # of rows in the results
#               board_id[0..N]  int
#               board[0..N]     char[35]
#               score[0..N]     int
#               ranking[0..N]   int
#               facebook_id[0..N] int
#----------------------------------------------------------------------

class getLeaderboardHandler(Handler):

    def handle(self):
        postData = self.getPostData()
        try:
            gameID = int(postData['game_id'])
            with closing(self.cursor()) as cur:
                # people[facebookid].games_played += 1
                rows = None
                if postData.has_key('offset'):
                    sql = "select * from boards inner join people on people.facebook_id=boards.facebook_id where game_id=%s order by score desc, time_stamp asc limit %s,9"
                    cur.execute(sql, (gameID, int(postData['offset'])))
                    rows = cur.fetchall()
                elif postData.has_key('board_id'):
                    boardID = int(postData['board_id'])
                    sql = "select count(*) as rows from boards where game_id=%s"
                    cur.execute(sql, (gameID))
                    totalRows = cur.fetchone()['rows']
                    sql = "call getLeaderboard(%s)"
                    cur.execute(sql, (boardID))
                    rows = cur.fetchall()
                    self.add({"total_rows": totalRows})
                else:
                    error(self.output, Error.E_MISSINGPARAM)
                if rows:
                    rowIndex = 0
                    for row in rows:
                        self.add({
                            "board_id%d" % (rowIndex): row['board_id'],
                            "board%d" % (rowIndex): row['board'],
                            "score%d" % (rowIndex): row['score'],
                            "ranking%d" % (rowIndex): row['ranking'],
                            "offset%d" % (rowIndex): row['offset'],
                            "facebook_id%d" % (rowIndex): row['facebook_id'],
                            "name%d" % (rowIndex): row['name']
                                })
                        rowIndex += 1
                    self.add({"rows": rowIndex})
        except KeyError, e:
            error(self.output, Error.E_MISSINGPARAM)
        except ValueError, e:
            error(self.output, Error.E_BADINPUT)
        except mdb.DatabaseError, e:
            error(self.output, Error.E_DBASEERROR)

#----------------------------------------------------------------------
# action:results
#
# parameters:   game_id         int
#               board_id        optional int        either specify this or the next parameter
#               offset          optional int        if this exists, use it, else centre on the boardid
#
# response:     offset          int                 offset, total_rows only returned if boardid specified
#               total_rows      int
#               rows            int                 # of rows in the results
#               board_id[0..N]  int
#               board[0..N]     char[35]
#               score[0..N]     int
#               ranking[0..N]   int
#               facebook_id[0..N] int
#----------------------------------------------------------------------

class resultsHandler(Handler):

    def handle(self):
        postData = self.getPostData()
        try:
            gameID = int(postData['game_id'])
            with closing(self.cursor()) as cur:
                # people[facebookid].games_played += 1
                rows = None
                if postData.has_key('offset'):
                    sql = "select * from boards inner join people on people.facebook_id=boards.facebook_id where game_id=%s order by score desc, time_stamp asc limit %s,9"
                    cur.execute(sql, (gameID, int(postData['offset'])))
                    rows = cur.fetchall()
                elif postData.has_key('board_id'):
                    boardID = int(postData['board_id'])
                    sql = "select count(*) as rows from boards where game_id=%s"
                    cur.execute(sql, (gameID))
                    totalRows = cur.fetchone()['rows']
                    sql = "call getLeaderboard(%s)"
                    cur.execute(sql, (boardID))
                    rows = cur.fetchall()
                    self.add({"total_rows": totalRows})
                else:
                    error(self.output, Error.E_MISSINGPARAM)
                if rows:
                    rowIndex = 0
                    for row in rows:
                        self.add({
                            "board_id%d" % (rowIndex): row['board_id'],
                            "board%d" % (rowIndex): row['board'],
                            "score%d" % (rowIndex): row['score'],
                            "ranking%d" % (rowIndex): row['ranking'],
                            "offset%d" % (rowIndex): row['offset'],
                            "facebook_id%d" % (rowIndex): row['facebook_id'],
                            "name%d" % (rowIndex): row['name']
                                })
                        rowIndex += 1
                    self.add({"rows": rowIndex})
        except KeyError, e:
            error(self.output, Error.E_MISSINGPARAM)
        except ValueError, e:
            error(self.output, Error.E_BADINPUT)
        except mdb.DatabaseError, e:
            error(self.output, Error.E_DBASEERROR)

#----------------------------------------------------------------------
# action:post
#
# parameters:   facebook_id     uint64      // facebook_id
#               board           char[35]    // current board
#               game_id     int             // current game_id
#
# response:     score           int         // score of that board
#               board_id        int         // index into boards table
#               end_time        datetime    // when current game ends
#               current_time    datetime    // server time
#----------------------------------------------------------------------

class postHandler(Handler):

    def updateBoard(self, boardID, board, score):
        try:
            with closing(self.cursor()) as cur:
                tm = getCurrentTime()
                sql = "update boards set board=%s, score=%s, time_stamp=%s where board_id=%s"
                cur.execute(sql, (board, score, tm, boardID))
        except mdb.DatabaseError, e:
            pass
        return None

    #----------------------------------------------------------------------

    def insertNewBoard(self, board, score, fbid, gameID):
        try:
            with closing(self.cursor()) as cur:
                sql = "insert into boards (game_id, board, score, time_stamp, facebook_id) values (%s,%s,%s,%s,%s)"
                cur.execute(sql, (gameID, board, score, getCurrentTime(), fbid))
                return cur.lastrowid
        except mdb.DatabaseError, e:
            return None

    #----------------------------------------------------------------------

    def getLBPosition(self, score, fbid, gameID):
        try:
            with closing(self.cursor()) as cur:
                sql = """
                    select
                        (select count(*) from boards where game_id = %s) as leaderboard_size,
                        (select count(*) from boards where game_id = %s and score > %s order by score desc, time_stamp asc) as leaderboard_position
                    """
                cur.execute(sql, (gameID, gameID, score))
                return cur.fetchone()
        except mdb.DatabaseError, e:
            return None

    #----------------------------------------------------------------------

    def handle(self):
        try:
            postData = self.getPostData()

            # convert to the right datatypes
            try:
                boardID = int(postData["board_id"])
                board = postData["board"]
                facebookID = int(postData["facebook_id"])
                gameID = int(postData["game_id"])
            except KeyError, e:
                error(self.output, Error.E_MISSINGPARAM)
                return None

            game = self.getCurrentGame()

            # check for some errors
            if not game:
                error(self.output, Error.E_NOGAME)
            elif int(gameID) != game["game_id"]:
                error(self.output, Error.E_BADGAMEID)
            else:
                final = False
                if game["current_time"] > game["end_time"]:
                    self.add({"final":1})
                score = getScore(board)
                if score < 0:
                    error(self.output, Error.E_BADBOARD)
                else:
                    if boardID == 0:
                        boardID = self.insertNewBoard(board, score, facebookID, gameID)
                    else:
                        self.updateBoard(boardID, board, score)
                    self.add({
                        "score": int(score),
                        "board_id": int(boardID),
                        "end_time": game["end_time"],
                        "current_time": game["current_time"]
                        })
                    self.add(self.getLBPosition(int(score), facebookID, int(gameID)))
        except ValueError, e:
            error(self.output, Error.E_MISSINGPARAM)

#----------------------------------------------------------------------
# application
#----------------------------------------------------------------------

def application(environ, start_response):
    output = dict()
    try:
        with closing(opendb()) as db:
            db.autocommit(True)
            getData = environ['QUERY_STRING']
            if getData:
                data = urlparse.parse_qs(getData)
                try:
                    globals()[data['action'][0] + "Handler"](environ, db, output).handle()
                except KeyError:
                    error(output, Error.E_BADACTION, ":" + data['action'][0])
            else:
                error(output, Error.E_NOACTION)

            mpt = getGlobal(db, 'min_ping_time')
            if mpt:
                output.update({ "min_ping_time":  mpt })

    except ValueError:
        error(output, Error.E_BADINPUT)
        pprint("Bad input: %s" % (environ['QUERY_STRING']))

    except mdb.Error, e:
        pprint("Database error %d: %s" % (e.args[0], e.args[1]))
        error(output, Error.E_DBASEERROR)

    output = encoded_dict(output)
    outputStr = json.dumps(output, indent=4, separators=(',',': '))
    headers = [('Content-type', 'text/plain'), ('Content-Length', str(len(outputStr)))]
    org = environ['HTTP_ORIGIN']
    if org.lower() in ['http://www.make-the-words.com',
                      'http://make-the-words.com']:
        headers.append(('Access-Control-Allow-Origin', org))
    else:
        pprint("Origin: %s is not allowed" % (org))
    start_response('200 OK', headers)
    return outputStr
