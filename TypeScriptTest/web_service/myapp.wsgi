#----------------------------------------------------------------------
# !NOTE! this runs as (potentially) many simultaneous threads/processes...
#----------------------------------------------------------------------

import os
import traceback
import sys
import datetime
import socket
import threading
import json
import MySQLdb as mdb
import MySQLdb.cursors
from contextlib import closing
import urlparse
import urllib
import urllib2
import pprint
from time import sleep

sys.path.append('/usr/local/www/wsgi-scripts')
os.chdir('/usr/local/www/wsgi-scripts')
from dbaseconfig import *

logString = ""

#----------------------------------------------------------------------

e_badaction             = { "error": 1, "msg": "bad action",             "status": "400 bad request" }
e_dbasebusy             = { "error": 2, "msg": "database is busy",       "status": "500 internal server error" }
e_dbaseerror            = { "error": 3, "msg": "database error",         "status": "500 internal server error" }
e_badorigin             = { "error": 4, "msg": "invalid request origin", "status": "401 unauthorized" }
e_unknownuser           = { "error": 5, "msg": "unknown user",           "status": "400 bad request" }
e_invalidboard          = { "error": 6, "msg": "invalid board",          "status": "400 bad request" }
e_missingparameter      = { "error": 7, "msg": "missing parameter",      "status": "400 bad request" }
e_badmethod             = { "error": 8, "msg": "invalid method",         "status": "405 method not allowed" }
e_badparameter          = { "error": 9, "msg": "bad parameter",          "status": "400 bad request" }
e_gameended             = { "error":10, "msg": "game over",              "status": "200 OK" }

class Error(Exception):
    pass

#----------------------------------------------------------------------
# utils
#----------------------------------------------------------------------

#----------------------------------------------------------------------
# for JSON dates

def date_handler(obj):
    return obj.isoformat() if hasattr(obj, 'isoformat') else obj

#----------------------------------------------------------------------
# switch offable log

logString = ""

def resetLog():
    global logString
    logString = ""

def log(x, y = ""):
    x = str(x).replace("\\n", "\n")
    if type(y) is not str:
        y = pprint.pformat(y, 0, 120).replace("\\n", "\n")
    global logString
    logString += x + y + "\n"

def dumpLog():
    print >> sys.stderr, logString,

#----------------------------------------------------------------------
# call the local helper service

def service(dict):
    with closing(socket.socket()) as s:
        try:
            s.connect(("127.0.0.1", 1338))
            s.send(urllib.urlencode(dict))
            return json.loads(s.recv(8192))
        except:
            log("Error, can't connect to helper!")
            return None

#----------------------------------------------------------------------
# turn a urlencoded string into a dictionary, duplicate assignments are discarded

def query_to_dict(q):
    return dict((k, v[0]) for k, v in urlparse.parse_qs(q).iteritems())

#----------------------------------------------------------------------
# open the database

def opendb():
    conn = mdb.connect( host        = db_host(),
                        user        = db_user(),
                        passwd      = db_password(),
                        db          = db_db(),
                        use_unicode = True,
                        cursorclass = MySQLdb.cursors.DictCursor,
                        charset     = 'utf8')
    conn.autocommit(True)
    return conn

#----------------------------------------------------------------------
# get the score (and if it's valid) for a board of a seed

def get_board_score(board, seed):
    return service({ 'action': 'getscore', 'board': board, 'seed': seed })

#----------------------------------------------------------------------
# check list of parameters in a query or post string

def check_parameters(pq, strings):
    for i in strings:
        if not i in pq:
            raise(Error(e_missingparameter))

def get_count(cur, table, condition, params):
    cur.execute("SELECT COUNT(*) FROM `" + mdb.escape_string(table) + "` WHERE " + condition, params)
    return cur.fetchone().keys()[0]

#----------------------------------------------------------------------
# check http origin is in the valid list

def origin_is_valid(db, environ):
    if 'HTTP_ORIGIN' in environ:
        with closing(db.cursor()) as cur:
            count = get_count(cur, "sites", "site_url = %(HTTP_ORIGIN)s", environ)
            if count > 0:
                return environ['HTTP_ORIGIN']
    return None

#----------------------------------------------------------------------
# get an object as a JSON string

def getJSON(x):
    return json.dumps(x, indent = 4, separators=(',',': '), default = date_handler)

#----------------------------------------------------------------------
# Handler - base for all request handlers
#----------------------------------------------------------------------

class Handler(object):

    def __init__(self, query, post, output):
        self.query = query
        self.post = post
        self.output = output
        self.showOutput = True
        self.status = '200 OK'

    #----------------------------------------------------------------------

    def add(self, x):
        self.output.update(x)

    #----------------------------------------------------------------------

    def err(self, e):
        raise(Error(e))

    #----------------------------------------------------------------------

    def processRequest(self, db):
        with closing(db.cursor()) as cur:
            self.handle(cur, db)
            db.commit()
            if self.showOutput:
                log("Output:", getJSON(self.output))
            return self.status

#----------------------------------------------------------------------
# GET:oauthlist - get a list of oauth providers
#
# parameters:   none
#
# response:     array of:
#                   id              int
#                   name            int
#                   logo            url
#----------------------------------------------------------------------

class oauthlistHandler(Handler):

    def handle(self, cur, db):
        cur.execute("SELECT * FROM oauth_providers WHERE oauth_provider > 0")
        self.add( { "providers": cur.fetchall() } )

#----------------------------------------------------------------------
# GET:game - get board for a user's game in progress, if there is one
#
# parameters:   user_id     uint32
#               seed        uint32
#
# response:     board       string
#----------------------------------------------------------------------

class gameHandler(Handler):

    def handle(self, cur, db):
        check_parameters(self.query, ['user_id', 'seed'])
        cur.execute("SELECT * FROM boards WHERE user_id=%(user_id)s AND seed=%(seed)s", self.query)
        row = cur.fetchone()
        if row is None:
            self.add({"error": "No such board for user,seed"})
        else:
            self.add(row)

#----------------------------------------------------------------------
# GET:session - get current or extend or create session
#               this will become relevant when refresh tokens are used
#
# parameters:   session_id => "X",
#
# response:     user_id     uint32
#               user_name   string
#               user_picture url
#----------------------------------------------------------------------

class sessionHandler(Handler):

    def handle(self, cur, db):
        check_parameters(self.query, ['session_id'])
        timestamp = datetime.datetime.now()
        now = timestamp.isoformat()
        cur.execute("""SELECT users.user_id, users.name, users.picture, oauth_providers.oauth_name as providerName FROM sessions
                        INNER JOIN users ON users.user_id = sessions.user_id
                        INNER JOIN oauth_providers ON oauth_providers.oauth_provider = users.oauth_provider
                        WHERE sessions.session_id = %(session_id)s
                        AND sessions.expires > %(now)s""",
                    {
                        'session_id': self.query['session_id'],
                        'now': datetime.datetime.now().isoformat()
                    })
        row = cur.fetchone()
        if row is None:
            self.add({"error": "Session expired"})
        else:
            self.add(row)

#----------------------------------------------------------------------
# POST:anon - login an anonymous user, return a session_id
#
# parameters:   none
#
# response:     session_id: uint32
#----------------------------------------------------------------------

def createSession(self, cur, db, d):
    timestamp = datetime.datetime.now()
    now = timestamp.isoformat()
    then = (timestamp + datetime.timedelta(days = 30)).isoformat()
    cur.execute("SELECT * FROM users WHERE oauth_sub=%(oauth_sub)s AND oauth_provider=%(oauth_provider)s", d)
    row = cur.fetchone()
    if row is None:
        self.err(e_dbaseerror)

    user_id = row['user_id']
    user_name = row['name'];
    user_picture = row['picture'];
    cur.execute("SELECT * FROM sessions WHERE user_id = %(user_id)s AND expires > %(now)s ORDER BY created DESC LIMIT 1", locals())
    row = cur.fetchone()
    if row is None:
        # session expired, or didn't exist, create a new one
        cur.execute("INSERT INTO sessions(user_id, created, expires) VALUES (%(user_id)s, %(now)s, %(then)s)", locals())
        session_id = db.insert_id()
    else:
        # existing session, extend it
        session_id = row['session_id']
        cur.execute("UPDATE sessions SET expires = %(then)s WHERE session_id = %(session_id)s", locals())
    self.add({"session_id": session_id})
    self.add({"user_id": user_id})

class anonHandler(Handler):

    def handle(self, cur, db):
        cur.execute("""INSERT INTO anons (created) VALUES (%s)""", datetime.datetime.now().isoformat())
        anon_id = db.insert_id()
        cur.execute("""INSERT INTO users (oauth_sub, oauth_provider, name, picture)
                        VALUES (%(anon_id)s, 0, 'Anon', 'http://make-the-words.com/img/anon.png')""", locals())
        createSession(self, cur, db, { "oauth_sub": anon_id, "oauth_provider": 0 })

#----------------------------------------------------------------------
# POST:login - login a user, return a session_id
#
# parameters:   oauth_provider: uint32
#               oauth_sub: string
#               name: string
#               picture: string
#               [anon_user_id]: int
#
# response:     session_id: int
#----------------------------------------------------------------------

class loginHandler(Handler):

    def handle(self, cur, db):
        check_parameters(self.post, ['oauth_sub', 'oauth_provider', 'name', 'picture'])
        if('anon_user_id' in self.post):
            cur.execute("SELECT COUNT(*) AS count FROM users WHERE oauth_sub=%(oauth_sub)s AND oauth_provider=%(oauth_provider)s""", self.post)
            if cur.fetchone()['count'] == 0:
                log("Migrating user " + str(self.post['anon_user_id']))
                cur.execute("""UPDATE users SET
                                oauth_sub = %(oauth_sub)s,
                                oauth_provider=%(oauth_provider)s,
                                name = %(name)s,
                                picture = %(picture)s
                                WHERE user_id=%(anon_user_id)s""", self.post)
        else:
            cur.execute("""INSERT INTO users (oauth_sub, oauth_provider, name, picture)
                            VALUES (%(oauth_sub)s, %(oauth_provider)s, %(name)s, %(picture)s)
                            ON DUPLICATE KEY UPDATE name = %(name)s, picture = %(picture)s""", self.post)
        createSession(self, cur, db, self.post)

#----------------------------------------------------------------------
# GET:game - get current game
#
# parameters:
#
#               user_id: uint32
#
# response:     game_id: int
#               seed: int
#               start_time: datetime
#               end_time: datetime
#----------------------------------------------------------------------

class gameHandler(Handler):

    def handle(self, cur, db):
        cur.execute("SELECT * FROM games ORDER BY end_time DESC LIMIT 1")
        row = cur.fetchone()
        if row is not None:
            self.add(row)
            self.add({ 'now': datetime.datetime.now() })
        else:
            self.err(e_dbaseerror)

#----------------------------------------------------------------------
# GET:gameInfo - get some info about a game
#
# parameters:
#               game_id: uint32
#
# response:
#               [word, score...]
#----------------------------------------------------------------------

class gameInfoHandler(Handler):

    def handle(self, cur, db):
        check_parameters(self.query, ['game_id'])
        cur.execute("SELECT DISTINCT word, score, name FROM words INNER JOIN users ON users.user_id = words.user_id WHERE game_id=%(game_id)s ORDER BY score DESC LIMIT 3", self.query)
        self.add({ 'topWords': cur.fetchall() })
        # rarest word
        # commonest word
        # etc

#----------------------------------------------------------------------
# POST:board - post a new best board for a user
#
# parameters:
#               board: string
#               user_id: uint32
#               seed: uint32
#
# response:     score:      uint32
#----------------------------------------------------------------------

class boardHandler(Handler):

    def handle(self, cur, db):
        check_parameters(self.post, ['board', 'user_id', 'seed', 'game_id'])

        cur.execute("SELECT COUNT(*) AS count FROM users WHERE user_id=%(user_id)s", self.post)
        if cur.fetchone()['count'] == 0:
            self.err(e_unknownuser)

        game_id = self.post['game_id']
        board = self.post['board']
        user_id = self.post['user_id']
        seed = int(self.post['seed'])
        game_over = False

        cur.execute("SELECT * from games where game_id = %(game_id)s", locals())
        row = cur.fetchone()
        if row is None:
            self.err(e_badparameter)

        end_time = row['end_time']
        real_seed = row['seed']

        if real_seed != seed:
            log("Bad seed (dbase says " + str(row['seed']) + ", post says " + str(seed) + ")")
            self.err(e_badparameter)

        now = datetime.datetime.now()

        game_over = now > end_time;

        check = get_board_score(board, seed)
        if(check is None or not "valid" in check):
            self.err(e_invalidboard)

        score = check.get('score')
        time_stamp = now.isoformat()

        cur.execute("SELECT * FROM boards WHERE user_id=%(user_id)s AND seed=%(seed)s", locals())
        row = cur.fetchone()
        if row is None:
            cur.execute("""INSERT INTO boards (seed, game_id, board, score, user_id, time_stamp)
                            VALUES (%(seed)s, %(game_id)s, %(board)s, %(score)s, %(user_id)s, %(time_stamp)s)""", locals())
            board_id = db.insert_id()
        else:
            board_id = row['board_id']
            if row['score'] < score:
                cur.execute("UPDATE boards SET board=%(board)s, score=%(score)s WHERE user_id=%(user_id)s AND seed=%(seed)s", locals())

        # add the words in the board to the words table
        words = check.get('words')
        if words is not None and len(words) > 0:
            sql = "INSERT IGNORE INTO words (word, user_id, game_id, score) VALUES {0} "
            vals = ()
            params = ()
            for word in words:
                vals += ("(%s, %s, %s, %s)",)
                params += (word['str'], user_id, game_id, word['score'],)
            sql = sql.format(','.join(vals))
            cur.execute(sql, params)

        self.add({ "score": score, "board_id": board_id })
        self.add({ "game_over": game_over })

#----------------------------------------------------------------------
# GET:definition - get a word definition
#
# parameters:   word: string
#
# response:     { "definition": "the definition of the word" }
#               { "error": "not a word" }
#----------------------------------------------------------------------

class definitionHandler(Handler):

    def handle(self, cur, db):
        check_parameters(self.query, ['word'])
        self.add(service(self.query))

#----------------------------------------------------------------------
# GET:leaderboard - get leaderboard
#
# parameters:   board_id: int
#               game_id: int
#               buffer: int - how many above/below you want
#
#               if board_id is 0, just get the LB at offset, page_size
#
# response:     a whole mess of json
#----------------------------------------------------------------------

class leaderboardHandler(Handler):

    def handle(self, cur, db):
        check_parameters(self.query, ['board_id', 'offset', 'page_size', 'game_id'])
        page_size = int(self.query['page_size'], 10)
        board_id = int(self.query['board_id'], 10)
        if (page_size > 30):
            self.err(e_badparameter)
        cur.execute("SELECT COUNT(*) AS total FROM boards WHERE game_id = %(game_id)s", self.query)
        self.add({ "total": cur.fetchone()['total'] })
        cur.close()
        cur = db.cursor()
        if board_id != 0:
            cur.execute("CALL getLB(%(board_id)s, %(offset)s, %(page_size)s)", self.query)  # should check that board_id and game_id are copacetic
        else:
            cur.execute("CALL getLBPage(%(game_id)s, %(offset)s, %(page_size)s)", self.query)
        self.add({ "leaderboard": cur.fetchall() })
        self.showOutput = False

#----------------------------------------------------------------------
# application
#----------------------------------------------------------------------

def application(environ, start_response):

    resetLog()

    log("--------------------------------------------------------------------------------")
    headers = [('Content-type', 'application/json')]
    output = dict()
    status = '200 OK'
    try:
        with closing(opendb()) as db:
            org = origin_is_valid(db, environ);
            if org is None:
                raise(Error(e_badorigin))
            headers.append(('Access-Control-Allow-Origin', org))
            method = environ['REQUEST_METHOD']
            query = query_to_dict(environ.get('QUERY_STRING', ""))
            post = dict()
            if method == 'POST':
                post = query_to_dict(environ['wsgi.input'].read(int(environ.get('CONTENT_LENGTH', 4096), 10)))  # 4096? should be enough...
            elif method != 'GET':
                raise(Error(e_badmethod))
            log("Action:", query['action'])
            log("Method:", method)
            log("Query:", query)
            log("Post:", post)
            func = query.get('action', '!') + 'Handler'
            if not func in globals():
                raise(Error(e_badaction))
            status = globals()[func](query, post, output).processRequest(db)
    except Error as e:
        d = e.args[0]
        output = d;
        status = d['status']
        log("Error: " + d['msg'])
    except mdb.Error, e:
        log("Database error:" + pprint.pformat(e.args))
        status = "500 Internal Server Error"
        raise
    except TypeError, e:
        log("TypeError: " + pprint.pformat(e.args))
        status = "500 Internal Server Error"
        raise
    except AttributeError, e:
        log("AttributeError: " + pprint.pformat(e.args))
        status = "500 Internal Server Error"
        raise
    except ImportError, e:
        log("ImportError: " + pprint.pformat(e.args))
        status = "500 Internal Server Error"
        raise

    dumpLog()

    outputStr = getJSON(output)
    headers.append(('Content-Length', str(len(outputStr))))
    start_response(status, headers)
    return outputStr
