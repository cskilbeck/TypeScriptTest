#! /usr/bin/env python

import sys
import socket
import pprint
import argparse
import json
import urllib
from urlparse import parse_qs
import signal
from time import gmtime, strftime
from termcolor import colored

def signal_handler(signal, frame):
    print "\nHRESULT server shutting down"
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

parser = argparse.ArgumentParser()
parser.add_argument("-p", "--port", help = "which port to listen on", type = int, action="store", default=1340)
parser.add_argument("-b", "--backlog", help = "accept backlog size", type = int, action="store", default=5)
parser.add_argument("-s", "--buffersize", help = "recv buffer size", type = int, action="store", default=4096)
args = parser.parse_args()

# load the hresult file
with open('hresults.json') as file:
    hresults = json.load(file)

print "Loaded %(count)s hresults" % {'count': len(hresults)}

#pprint.pprint(hresults['80000001'])

def output(socket, data):
    print "Sending:", pprint.pformat(data),
    socket.send(json.dumps(data))

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
s.bind(('', args.port))
s.listen(args.backlog)
print "Listening on port", args.port, 'backlog size', args.backlog, 'buffer size', args.buffersize
complete = False
while not complete:
    recv_socket = None
    try:
        recv_socket, address = s.accept()
        data = recv_socket.recv(args.buffersize)
        found = False
        if data:
            d = parse_qs(urllib.unquote(data))
            print "Received:", pprint.pformat(d),
            if "code" in d:
                code = d['code'][0]
                if code in hresults:
                    results = { 'status': "ok", 'text': hresults[code].encode('utf-8') }
                else:
                    results = { 'status': "error", 'text': "not found" }
            else:
                results = { 'status': "error", 'text': "missing parameter 'code'" }
            output(recv_socket, results)
    finally:
        print
        if recv_socket is not None:
            recv_socket.close()
            recv_socket = None
