#----------------------------------------------------------------------
# !NOTE! this runs as (potentially) many simultaneous processes...
#----------------------------------------------------------------------

import os
import traceback
import sys
import datetime
import socket
import json
import MySQLdb as mdb
import MySQLdb.cursors
from contextlib import closing
import urlparse
import urllib
import urllib2
import pprint

sys.path.append('/usr/local/www/wsgi-scripts')
os.chdir('/usr/local/www/wsgi-scripts')
from dbaselogin import *

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

class Error(Exception):
    pass

#----------------------------------------------------------------------
# utils
#----------------------------------------------------------------------

# switch offable log

def log(x, y = ""):
    print >> sys.stderr, pprint.pformat(x + pprint.pformat(y, 0, 120))
    # pass

# get something from the local helper

def service(dict):
    with closing(socket.socket()) as s:
        s.connect(("127.0.0.1", 1338))
        s.send(urllib.urlencode(dict))
        return json.loads(s.recv(8192))

# turn a urlencoded string into a dictionary, duplicate assignments are discarded

def query_to_dict(q):
    return dict((k, v[0]) for k, v in urlparse.parse_qs(q).iteritems())

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

# get a time formatted for MySQL

def formattedTime(t):
    return datetime.datetime.strftime(t, "%Y-%m-%d %H:%M:%S.%f")

# get the score (and if it's valid) for a board of a seed

def get_board_score(board, seed):
    return service({ 'action': 'getscore', 'board': board, 'seed': seed })

# check list of parameters in a query or post string

def check_parameters(pq, strings):
    for i in strings:
        if not i in pq:
            raise(Error(e_missingparameter))

# check http origin is in the valid list

def origin_is_valid(db, environ):
    if 'HTTP_ORIGIN' in environ:
        with closing(db.cursor()) as cur:
            cur.execute("SELECT COUNT(*) AS count FROM sites WHERE site_url = %(HTTP_ORIGIN)s", environ)
            return cur.fetchone()['count'] > 0
    return false

#----------------------------------------------------------------------
# Handler - base for all request handlers
#----------------------------------------------------------------------

class Handler(object):

    def __init__(self, query, post, output):
        self.query = query
        self.post = post
        self.output = output
        self.status = '200 OK'

    #----------------------------------------------------------------------

    def add(self, x):
        self.output.update(x)

    #----------------------------------------------------------------------

    def err(e):
        raise(Error(e))

    #----------------------------------------------------------------------

    def processRequest(self, db):
        with closing(db.cursor()) as cur:
            self.handle(cur, db)
            db.commit()
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

        cur.execute("""SELECT board, score, board_id FROM boards WHERE user_id=%(user_id)s AND seed=%(seed)s""", self.query)
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
        now = formattedTime(timestamp)
        cur.execute("""SELECT users.user_id, users.name, users.picture, oauth_providers.oauth_name as providerName FROM sessions
                        INNER JOIN users ON users.user_id = sessions.user_id
                        INNER JOIN oauth_providers ON oauth_providers.oauth_provider = users.oauth_provider
                        WHERE sessions.session_id = %(session_id)s
                        AND sessions.expires > %(now)s""",
                        {   'session_id': self.query['session_id'],
                            'now': formattedTime(datetime.datetime.now())
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
    now = formattedTime(timestamp)
    then = formattedTime(timestamp + datetime.timedelta(days = 30))
    cur.execute("""SELECT * FROM users
                    WHERE oauth_sub=%(oauth_sub)s
                    AND oauth_provider=%(oauth_provider)s""", d)
    row = cur.fetchone()
    if row is None:
        self.err(e_dbaseerror)

    user_id = row['user_id']
    user_name = row['name'];
    user_picture = row['picture'];
    cur.execute("""SELECT * FROM sessions
                    WHERE user_id = %(user_id)s AND expires > %(now)s
                    ORDER BY created DESC LIMIT 1""", locals())
    row = cur.fetchone()
    if row is None:
        # session expired, or didn't exist, create a new one
        cur.execute("""INSERT INTO sessions(user_id, created, expires)
                        VALUES (%(user_id)s, %(now)s, %(then)s)""", locals())
        session_id = db.insert_id()
    else:
        # existing session, extend it
        session_id = row['session_id']
        cur.execute("""UPDATE sessions
                        SET expires = %(then)s
                        WHERE session_id = %(session_id)s""", locals())
    self.add({"session_id": session_id})

class anonHandler(Handler):

    def handle(self, cur, db):
        timestamp = datetime.datetime.now()
        now = formattedTime(timestamp)
        cur.execute("""INSERT INTO anons (created) VALUES (%(now)s)""", locals())
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
#
# response:     session_id: uint32
#----------------------------------------------------------------------

class loginHandler(Handler):

    def handle(self, cur, db):
        check_parameters(self.post, ['oauth_sub', 'oauth_provider', 'name', 'picture'])
        cur.execute("""INSERT INTO users (oauth_sub, oauth_provider, name, picture)
                        VALUES (%(oauth_sub)s, %(oauth_provider)s, %(name)s, %(picture)s)
                        ON DUPLICATE KEY UPDATE name = %(name)s, picture = %(picture)s""", self.post)
        createSession(self, cur, db, self.post)

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
        check_parameters(self.post, ['board', 'user_id', 'seed'])

        cur.execute("SELECT COUNT(*) AS count FROM users WHERE user_id=%(user_id)s", self.post);
        if cur.fetchone()['count'] == 0:
            self.err(e_unknownuser)

        board = self.post['board']
        user_id = self.post['user_id']
        seed = self.post['seed']
        check = get_board_score(board, seed)
        if(not check.get('valid')):
            self.err(e_invalidboard)

        score = check.get('score')
        now = datetime.datetime.now()
        time_stamp = formattedTime(now)

        cur.execute("""SELECT * FROM boards WHERE user_id=%(user_id)s AND seed=%(seed)s""", locals())
        row = cur.fetchone()
        if row is None:
            cur.execute("""INSERT INTO boards (seed, board, score, user_id, time_stamp)
                            VALUES (%(seed)s, %(board)s, %(score)s, %(user_id)s, %(time_stamp)s)""", locals())
            board_id = db.insert_id()
        else:
            board_id = row['board_id']
            if row['score'] < score:
                cur.execute("""UPDATE boards SET board=%(board)s, score=%(score)s
                                WHERE user_id=%(user_id)s AND seed=%(seed)s""", locals())
        self.add({ "score": score, "board_id": board_id })

#----------------------------------------------------------------------
# GET:leaderboard - get leaderboard
#
# parameters:   board_id: uint32
#               buffer: uint - how many above/below you want
#
# response:     a whole mess of json
#----------------------------------------------------------------------

class leaderboardHandler(Handler):

    def handle(self, cur, db):
        check_parameters(self.query, ['board_id', 'buffer'])
        buffer = int(self.query['buffer'], 10)
        if (buffer > 30):
            self.err(e_badparameter)
        cur.execute("SELECT * FROM boards WHERE board_id = %(board_id)s", self.query)
        row = cur.fetchone()
        if row is None:
            self.err(e_invalidboard)
        seed = row['seed']
        cur.execute("SELECT COUNT(*) AS total FROM boards WHERE seed = %(seed)s", row)
        self.add({"total": cur.fetchone()['total']})
        cur.close()
        cur = db.cursor()
        cur.execute("CALL getLB(%(board_id)s, %(buffer)s)", self.query)
        self.add({"leaderboard": cur.fetchall() })

#----------------------------------------------------------------------
# application
#----------------------------------------------------------------------

def application(environ, start_response):

    headers = [('Content-type', 'application/json')]
    output = dict()
    status = '200 OK'
    print >> sys.stderr, "--------------------------------------------------------------------------------"
    try:
        with closing(opendb()) as db:
            if not origin_is_valid(db, environ):
                raise(Error(e_badorigin))
            headers.append(('Access-Control-Allow-Origin', environ['HTTP_ORIGIN']))
            method = environ['REQUEST_METHOD']
            query = query_to_dict(environ.get('QUERY_STRING', ""))
            post = dict()
            if method == 'POST':
                post = query_to_dict(environ['wsgi.input'].read(int(environ.get('CONTENT_LENGTH', 4096), 10)))  # 4096? should be enough...
            elif method != 'GET':
                raise(Error(e_badmethod))
            log("Action: ", query['action'])
            log("Method:", method)
            log("Query:", query)
            log("Post:", post)
            func = query.get('action', '!') + 'Handler'
            if not func in globals():
                raise(Error(e_badaction))
            status = globals()[func](query, post, output).processRequest(db)
    except Error as e:
        print >> sys.stderr, pprint.pformat(e.args)
        d = e.args[0]
        output = d;
        status = d['status']
        print >> sys.stderr, "Error!"
        print >> sys.stderr, d['msg']
    except mdb.Error, e:
        print >> sys.stderr, "Database error:"
        print >> sys.stderr, pprint.pformat(e.args)
        status = "500 Internal Server Error"
        raise
    except TypeError, e:
        print >> sys.stderr, "TypeError:"
        print >> sys.stderr, pprint.pformat(e.args)
        status = "500 Internal Server Error"
        raise
    except AttributeError, e:
        print >> sys.stderr, "AttributeError:"
        print >> sys.stderr, pprint.pformat(e.args)
        status = "500 Internal Server Error"
        raise
    except ImportError, e:
        print >> sys.stderr, "ImportError:"
        print >> sys.stderr, pprint.pformat(e.args)
        status = "500 Internal Server Error"
        raise

    outputStr = json.dumps(output, indent = 0, separators=(',',': '))

    print >> sys.stderr, "Output..."

    headers.append(('Content-Length', str(len(outputStr))))
    start_response(status, headers)
    return outputStr
