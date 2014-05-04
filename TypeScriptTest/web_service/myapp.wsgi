#----------------------------------------------------------------------
# !NOTE! this runs as (potentially) many simultaneous processes...
#----------------------------------------------------------------------

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

sys.path.append('/usr/local/www/wsgi-scripts/')

import dbaselogin


#----------------------------------------------------------------------

E_BADACTION             = [1, "Bad action", "400 Bad Request"]
E_DBASEBUSY             = [2, "Database is busy", "500 Internal Server Error"]
E_DBASEERROR            = [3, "Database error", "500 Internal Server Error"]
E_BADREFERER            = [4, "Invalid request origin", "401 Unauthorized"]
E_UNKNOWNUSER           = [5, "unknown user", "400 Bad Request"]
E_INVALIDBOARD          = [6, "invalid board", "400 Bad Request"]
E_MISSINGPARAMETER      = [7, "missing parameter", "400 Bad Request"]
E_BADMETHOD             = [8, "invalid method", '405 Method not allowed']

class Error:

    def __init__(self, value, message = ""):
        self.value = value
        self.message = message

    def index(self):
        return self.value[0]

    def str(self):
        return self.value[1]

    def status(self):
        return self.value[2]

    def output(self):
        return { "error": self.index(), "errorDescription": self.str() + self.message }

#----------------------------------------------------------------------
# utils
#----------------------------------------------------------------------

# switch offable log

def log(x, y = ""):
    pprint.pprint(x + pprint.pformat(y, 0, 120))
    # pass

# get something from the local helper

def service(dict):
    with closing(socket.socket()) as s:
        s.connect(("127.0.0.1", 1338))
        s.send(urllib.urlencode(dict))
        return json.loads(s.recv(8192))

# turn a urlencoded string into a dictionary, duplicate assignments are discarded

def query_to_JSON(q):
    return dict((k, v[0]) for k, v in urlparse.parse_qs(q).iteritems())

# turn a dictionary into a urlencoded string

def encoded_dict(in_dict):
    out_dict = {}
    for k, v in in_dict.iteritems():
        if isinstance(v, unicode):
            v = v.encode('utf8')
        elif isinstance(v, str):
            v.decode('utf8') # Must be encoded in UTF-8 - set the option in the database
        out_dict[k] = v
    return out_dict

# open the database

def opendb():
    return  mdb.connect(host        = dbaselogin.host(),
                        user        = dbaselogin.user(),
                        passwd      = dbaselogin.password(),
                        db          = dbaselogin.db(),
                        use_unicode = True,
                        cursorclass = MySQLdb.cursors.DictCursor,
                        charset     = 'utf8')

# get a time formatted for MySQL

def formattedTime(t):
    return datetime.datetime.strftime(t, "%Y-%m-%d %H:%M:%S.%f")

# get the score (and if it's valid) for a board of a seed

def get_board_score(board, seed):
    return service({ 'action': 'getscore', 'board': board, 'seed': seed })

def check_parameters(pq, strings):
    for i in strings:
        if not i in pq:
            raise(Error(E_MISSINGPARAMETER))

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

    def err(e, extra = ""):
        raise(Error(e, extra))

    #----------------------------------------------------------------------

    def processRequest(self, db):
        with closing(db.cursor()) as cur:
            self.handle(cur)
            db.commit()
            return self.status

#----------------------------------------------------------------------
# GET:oauthlist
#
# parameters:   none
#
# response:     array of:
#                   id              int
#                   name            int
#                   logo            url
#----------------------------------------------------------------------

class oauthlistHandler(Handler):

    def handle(self, cur):
        cur.execute("SELECT * FROM oauth_providers WHERE oauth_provider > 0")
        self.add( { "providers": cur.fetchall() } )

#----------------------------------------------------------------------
# GET:game
#
# parameters:   user_id     uint32
#               seed        uint32
#
# response:     board       string
#----------------------------------------------------------------------

class gameHandler(Handler):

    def handle(self, cur):
        check_parameters(self.query, ['user_id', 'seed'])

        cur.execute("""SELECT board, score FROM boards WHERE user_id=%(user_id)s AND seed=%(seed)s""", self.query)
        row = cur.fetchone()
        if row is None:
            self.add({"error": "No such board for user,seed"})
        else:
            self.add(row)

#----------------------------------------------------------------------
# GET:session
#
# parameters:   session_id => "X",
#
# response:     user_id     uint32
#               user_name   string
#               user_picture url
#----------------------------------------------------------------------

class sessionHandler(Handler):

    def handle(self, cur):
        check_parameters(self.query, ['session_id'])

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
# POST:login
#
# parameters:   oauth_provider: uint32
#               oauth_sub: string
#               name: string
#               picture: string
#
# response:     session_id: uint32
#----------------------------------------------------------------------

class loginHandler(Handler):

    def handle(self, cur):
        check_parameters(self.post, ['oauth_sub', 'oauth_provider', 'name', 'picture'])

        timestamp = datetime.datetime.now()
        now = formattedTime(timestamp)
        then = formattedTime(timestamp + datetime.timedelta(days = 30))

        cur.execute("""INSERT INTO users (oauth_sub, oauth_provider, name, picture)
                        VALUES (%(oauth_sub)s, %(oauth_provider)s, %(name)s, %(picture)s)
                        ON DUPLICATE KEY UPDATE name = %(name)s, picture = %(picture)s""", self.post)
        cur.execute("""SELECT * FROM users
                        WHERE oauth_sub=%(oauth_sub)s
                        AND oauth_provider=%(oauth_provider)s""", self.post)
        row = cur.fetchone()
        if row is None:
            self.err(E_DBASEERROR)

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
            session_id = self.db.insert_id()
        else:
            # existing session, extend it
            session_id = row['session_id']
            cur.execute("""UPDATE sessions
                            SET expires = %(then)s
                            WHERE session_id = %(session_id)s""", locals())
        self.add({"session_id": session_id})

#----------------------------------------------------------------------
# action:board
#
# parameters:
#               board: string
#               user_id: uint32
#               seed: uint32
#
# response:     score:      uint32
#----------------------------------------------------------------------

class boardHandler(Handler):

    def handle(self, cur):
        check_parameters(self.post, ['board', 'user_id', 'seed'])

        cur.execute("SELECT COUNT(*) AS count FROM users WHERE user_id=%(user_id)s", self.post);
        if cur.fetchone()['count'] == 0:
            self.err(E_UNKNOWNUSER)

        board = self.post['board']
        user_id = self.post['user_id']
        seed = self.post['seed']
        check = get_board_score(board, seed)
        if(not check.get('valid')):
            self.err(E_INVALIDBOARD)

        score = check.get('score')
        now = datetime.datetime.now()
        time_stamp = formattedTime(now)

        cur.execute("""SELECT * FROM boards WHERE user_id=%(user_id)s AND seed=%(seed)s""", locals())
        row = cur.fetchone()
        if row is None:
            cur.execute("""INSERT INTO boards (seed, board, score, user_id, time_stamp)
                            VALUES (%(seed)s, %(board)s, %(score)s, %(user_id)s, %(time_stamp)s)""", locals())
        elif row['score'] < score:
            cur.execute("""UPDATE boards SET board=%(board)s, score=%(score)s
                            WHERE user_id=%(user_id)s AND seed=%(seed)s""", locals())
        self.add({ "score": score })

#----------------------------------------------------------------------

def origin_is_valid(db, environ):
    if 'HTTP_ORIGIN' in environ:
        with closing(db.cursor()) as cur:
            cur.execute("SELECT COUNT(*) AS count FROM sites WHERE site_url = %(HTTP_ORIGIN)s", environ)
            return cur.fetchone()['count'] > 0
    return false

#----------------------------------------------------------------------
# application
#----------------------------------------------------------------------

def application(environ, start_response):

    headers = [('Content-type', 'application/json')]
    output = dict()
    status = '200 OK'
    try:
        with closing(opendb()) as db:
            if not origin_is_valid(db, environ):
                raise(Error(E_BADREFERER))
            headers.append(('Access-Control-Allow-Origin', environ['HTTP_ORIGIN']))
            method = environ['REQUEST_METHOD']
            query = query_to_JSON(environ.get('QUERY_STRING', ""))
            post = dict()
            log("Method:", method)
            log("Query:", query)
            if method == 'POST':
                post = query_to_JSON(environ['wsgi.input'].read(int(environ.get('CONTENT_LENGTH', 4096), 10)))  # 4096? should be enough...
                log("Post:", post)
            elif method != 'GET':
                raise(Error(E_BADMETHOD))
            func = query.get('action', '!nosuch') + 'Handler'
            if not func in globals():
                raise(Error(E_BADACTION))
            status = globals()[func](query, post, output).processRequest(db)
    except Error as e:
        print("!")
        output.update(e.output())
        status = e.status()
    except mdb.Error, e:
        log("Database error %d: %s" % (e.args[0], e.args[1]))
        status = error(output, Error.E_DBASEERROR)

    log("Output:", output)
    log("--------------------------------------------------------------------------------")
    output = encoded_dict(output)
    outputStr = json.dumps(output, indent = 4, separators=(',',': '))
    headers.append(('Content-Length', str(len(outputStr))))
    start_response(status, headers)
    return outputStr
