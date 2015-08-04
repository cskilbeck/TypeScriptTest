#! /usr/bin/env python

# make it upper case
# remove whitespace
# strip leading '0X'
# scan for up to N matches
# return the json

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

# {
#  errors: [
#    [decimal, hex, name, comment, file],
#    [decimal, hex, name, comment, file]
#  ],
#  facilities: [
#    [decimal, name],
#    [decimal, name]
#  ]
# }

errors = None
facilities = None

def byteify(input):
    if isinstance(input, dict):
        return {byteify(key):byteify(value) for key,value in input.iteritems()}
    elif isinstance(input, list):
        return [byteify(element) for element in input]
    elif isinstance(input, unicode):
        return input.encode('utf-8')
    else:
        return input

# load the hresult file
fac = {}
with open('hresults.json') as file:
    hresults = byteify(json.load(file))
    errors = hresults['errors']
    facilities = hresults['facilities']
    for f in facilities:
        fac[int(f[0])] = f[1]
    pprint.pprint(fac)

print "Loaded %(errcount)s errors, %(faccount)s facilities" % {'errcount': len(errors), 'faccount': len(facilities)}

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
            print "Received:", pprint.pformat(d)
            if 'code' in d:
                code = "".join(d['code'][0].split()).lower()

                results = { 'status': "", 'numresults': 0, 'errors': [] }

                for err in errors:
                    if err[1].find(code) != -1:
                        f = fac.get((int(err[0]) >> 16) & 0x3ff, "UNKNOWN")
                        results['errors'].append({ 'name':err[2], 'description': err[3], 'file': err[4], 'error': err[1], 'number': err[0], 'facility': f })
                        if len(results['errors']) == 10:
                            break
                got = len(results['errors'])
                results['numresults'] = got
                if got > 0:
                    results['status'] = 'ok'
                else:
                    results['status'] = 'not found'

            else:
                results = { 'status': "error", 'text': "missing parameter 'code'" }
            output(recv_socket, results)
    finally:
        print
        if recv_socket is not None:
            recv_socket.close()
            recv_socket = None
