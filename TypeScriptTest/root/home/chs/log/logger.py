#! /usr/bin/env python

import sys
import socket
import pprint
import argparse
import signal
from time import gmtime, strftime
from termcolor import colored

parser = argparse.ArgumentParser()
parser.add_argument("-p", "--port", help = "which port to listen on", type = int)
parser.add_argument("-b", "--backlog", help = "accept backlog size", type = int)
parser.add_argument("-s", "--buffersize", help = "recv buffer size", type = int)
args = parser.parse_args()

port = args.port if args.port else 1339
backlog = args.backlog if args.backlog else 5
size = args.buffersize if args.buffersize else 1024
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
s.bind(('', port))
s.listen(backlog)
print "Listening on port ", port, 'backlog size', backlog, 'buffer size', size, '\n'
recv_socket = None
complete = False
while not complete:
    try:
        recv_socket, address = s.accept()
        data = recv_socket.recv(size)
        if data:
            t = colored(strftime("%Y-%m-%d %H:%M:%S", gmtime()), 'yellow', attrs=['bold'])
            if data[0] == 'Q':
                complete = True
                t += " Logger exiting..."
            elif data[0] == 'T':
                t += " " + data[1:]
            print t
    finally:
        if recv_socket is not None:
            recv_socket.close()
            recv_socket = None
