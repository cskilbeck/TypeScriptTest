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
    E_BADREFERER = [11,"Invalid request origin"]

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

def formattedTime(t):
    return datetime.datetime.strftime(t, "%Y-%m-%d %H:%M:%S.%f")

#----------------------------------------------------------------------

def getCurrentTime():
    return formattedTime(datetime.datetime.now())

#----------------------------------------------------------------------

def getOffsetTime(cur, off):
    return formattedTime(cur + off)

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
                cur.execute("select count(*) as existence from people where oauth_provider=%s and oauth_sub=%s", (oauth_id, oauth_sub))
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
                cur.execute("select * from oauth_providers where oauth_provider > 0")
                providers = []
                rows = cur.fetchall()
                for row in rows:
                    providers.append(row)
                self.add({"providers": providers})
        except mdb.DatabaseError, e:
            pprint(e)

#----------------------------------------------------------------------
# action:login
#
# parameters: POST
#               oauth_provider" => "1",
#               oauth_sub" => $r->id,
#               oauth_name" => $r->name,
#               oauth_picture" => $r->picture,
#
# response:     session     uint32
#               user_id     uint32
#               user_name   string
#               user_picture url
#----------------------------------------------------------------------

# create or update entry in the users table
# check if an unexpired session already exists for this user
# if not, create a session
# return the session, either way

class loginHandler(Handler):

    def handle(self):
        try:
            with closing(self.cursor()) as cur:
                timestamp = datetime.datetime.now()
                now = formattedTime(timestamp)
                then = formattedTime(timestamp + datetime.timedelta(days = 30))
                p = self.getPostData();

                cur.execute("""SELECT * FROM users
                                WHERE oauth_sub = %(oauth_sub)s
                                AND oauth_provider = %(oauth_provider)s""" % p)

                row = cur.fetchone();
                if row is None:
                    cur.execute("""INSERT INTO users (
                                    oauth_sub,
                                    oauth_provider,
                                    name,
                                    picture)
                                VALUES (
                                    '%(oauth_sub)s',
                                    %(oauth_provider)s,
                                    '%(name)s',
                                    '%(picture)s' )""" % p)
                    user_id = self.db.insert_id();
                    user_name = p['name'];
                    user_picture = p['picture'];
                else:
                    user_id = row['user_id'];
                    user_name = row['name'];
                    user_picture = row['picture'];

                # create or extend session
                cur.execute("""SELECT * FROM sessions
                                WHERE user_id = %(user_id)s
                                    AND expires > '%(now)s'
                                ORDER BY created DESC LIMIT 1""" %
                            {
                                'user_id': user_id,
                                'now': now
                            });
                row = cur.fetchone()
                if row is None:
                    # session expired, create a new one
                    cur.execute("""INSERT INTO sessions(user_id, created, expires)
                                    VALUES (%(user_id)s, '%(now)s', '%(then)s')""" % {
                                    'user_id': user_id,
                                    'now': now,
                                    'then': then })
                    session_id = self.db.insert_id()
                else:
                    # existing session, extend it
                    session_id = row['session_id']
                    cur.execute("""UPDATE sessions
                                    SET expires = '%(then)s'
                                    WHERE session_id = %(session_id)s""" % {
                                    'then': then,
                                    'session_id': session_id })

                # we should have a valid session_id here
                self.add({"session_id": session_id,
                          "user_id": user_id,
                          "user_name": user_name,
                          "user_picture": user_picture })
        except mdb.Error, e:
            pprint("Database error %d: %s" % (e.args[0], e.args[1]))
            error(self.output, Error.E_DBASEERROR)

#----------------------------------------------------------------------
# application
#----------------------------------------------------------------------

def application(environ, start_response):

    headers = [('Content-type', 'application/json')]
    output = dict()
    try:
        with closing(opendb()) as db:
            db.autocommit(True)
            if 'HTTP_ORIGIN' in environ:
                org = environ['HTTP_ORIGIN']
            else:
                org = ""
            valid = 0
            with closing(cursor(db)) as cur:
                cur.execute("SELECT COUNT(*) AS valid FROM sites WHERE site_url = %s", (org))
                valid = cur.fetchone()['valid']
            if valid == 1:
                headers.append(('Access-Control-Allow-Origin', org))
                getData = environ['QUERY_STRING']
                if getData:
                    data = urlparse.parse_qs(getData)
                    func = data['action'][0] + 'Handler'
                    if func in globals():
                        globals()[func](environ, db, output).handle()
                    else:
                        error(output, Error.E_BADACTION, ":" + data['action'][0])
                else:
                    error(output, Error.E_NOACTION)

                mpt = getGlobal(db, 'min_ping_time')
                if mpt:
                    output.update({ "min_ping_time":  mpt })
            else:
                error(output, Error.E_BADREFERER, ":" + org)

    except mdb.Error, e:
        pprint("Database error %d: %s" % (e.args[0], e.args[1]))
        error(output, Error.E_DBASEERROR)

    output = encoded_dict(output)
    outputStr = json.dumps(output, indent = 4, separators=(',',': '))
    headers.append(('Content-Length', str(len(outputStr))))
    start_response('200 OK', headers)
    return outputStr
