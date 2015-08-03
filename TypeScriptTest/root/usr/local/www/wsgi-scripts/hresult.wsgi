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
from contextlib import closing
import urlparse
import urllib
import urllib2
import pprint
from time import sleep

#----------------------------------------------------------------------

e_badaction             = { "error": 1, "msg": "bad action",             "status": "400 bad request" }
e_noaction              = { "error": 2, "msg": "missing action",         "status": "400 bad request" }
e_missingparameter      = { "error": 7, "msg": "missing parameter",      "status": "400 bad request" }
e_badmethod             = { "error": 8, "msg": "invalid method",         "status": "405 method not allowed" }
e_badparameter          = { "error": 9, "msg": "bad parameter",          "status": "400 bad request" }

class Error(Exception):
    pass

#----------------------------------------------------------------------
# utils
#----------------------------------------------------------------------

def query_to_dict(q):
    return dict((k, v[0]) for k, v in urlparse.parse_qs(q).iteritems())

#----------------------------------------------------------------------
# get an object as a JSON string

def getJSON(x):
    return json.dumps(x, indent = 4, separators=(',',': '), default = date_handler)

#----------------------------------------------------------------------
# for JSON dates

def date_handler(obj):
    return obj.isoformat() if hasattr(obj, 'isoformat') else obj

#----------------------------------------------------------------------
# Logger functions

logger = None

def resetLog():
    global logger
    logger = ""

def log(x, y = ""):
    x = str(x).replace("\\n", "\n")
    if type(y) is not str:
        y = pprint.pformat(y, 0, 120).replace("\\n", "\n")
    global logger
    logger += x + y + "\n"

def dumpLog():
    rootLogger = logging.getLogger('')
    rootLogger.setLevel(logging.DEBUG)
    socketHandler = logging.handlers.SocketHandler('localhost', logging.handlers.DEFAULT_TCP_LOGGING_PORT)
    rootLogger.addHandler(socketHandler)
    global logger
    logging.debug(logger)
    
#----------------------------------------------------------------------
# call the local helper service

def service(dict):
    with closing(socket.socket()) as s:
        try:
            s.connect(("127.0.0.1", 1340))
            s.send(urllib.urlencode(dict))
            return json.loads(s.recv(8192))
        except:
            log("Error, can't connect to helper!")
            return None

#----------------------------------------------------------------------
# check list of parameters in a query or post string

def check_parameters(pq, strings):
    for i in strings:
        if not i in pq:
            raise(Error(e_missingparameter))

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

    def processRequest(self):
        self.handle()
        if self.showOutput:
            log("Output:", getJSON(self.output))
        return self.status

#----------------------------------------------------------------------
# POST:message - print some info to the debug stream
#
# parameters:   text: string
#
# response:     ok: bool
#----------------------------------------------------------------------

class findHandler(Handler):

    def handle(self):
        check_parameters(self.query, ['code'])
        log("Message: " + self.query['code'])
        result = service(self.query)
        self.add(result)

#----------------------------------------------------------------------
# application
#----------------------------------------------------------------------

def application(environ, start_response):

    resetLog()

    #print(pprint.pformat(environ))

    headers = [('Content-type', 'application/json')]
    output = dict()
    status = '200 OK'
    try:
        headers.append(('Access-Control-Allow-Origin', '*'))
        method = environ['REQUEST_METHOD']
        query = query_to_dict(environ.get('QUERY_STRING', ""))
        log("")
        post = dict()
        if method == 'POST':
            post = query_to_dict(environ['wsgi.input'].read(int(environ.get('CONTENT_LENGTH', 4096), 10)))  # 4096? should be enough...
        elif method != 'GET':
            raise(Error(e_badmethod))
        if not 'action' in query:
            raise(Error(e_noaction))
        log("Action:", query['action'])
        log("Method:", method)
        log("Query:", query)
        log("Post:", post)
        func = query.get('action', '!') + 'Handler'
        log("FUNC:", func)
        if not func in globals():
            raise(Error(e_badaction))
        status = globals()[func](query, post, output).processRequest()
    except Error as e:
        d = e.args[0]
        output = d;
        status = d['status']
        log("Error: " + d['msg'])
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
