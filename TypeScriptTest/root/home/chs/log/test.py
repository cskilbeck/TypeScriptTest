
    #! /usr/bin/env python

    import sys
    import socket
    import pprint
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("-p", "--port", help = "which port to listen on", action = 'store', default = 1339, type = int)
    parser.add_argument("-q", "--quit", dest = "quit", action = "store_true", help = "terminate the logger")
    parser.add_argument("text", help = "text to send", nargs = '?')
    args = parser.parse_args()

    if not args.quit and not args.text:
        parser.print_help()
    else:
        port = int(args.port)
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect(('', port))
        if args.quit:
            s.send('Q')
        elif args.text:
            s.send('T' + args.text)
        else:
            parser.print_help()
        s.close()