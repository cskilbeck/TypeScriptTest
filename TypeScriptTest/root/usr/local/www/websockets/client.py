#! /usr/bin/python

from autobahn.twisted.websocket import WebSocketClientProtocol, WebSocketClientFactory


class MyClientProtocol(WebSocketClientProtocol):

    def onConnect(self, response):
        print("Server connected: {0}".format(response.peer))

    def onOpen(self):
        print("WebSocket connection open.")

        def hello():
            self.sendMessage(u"Hello, world!".encode('utf8'))
            self.sendMessage(b"\x00\x01\x03\x04", isBinary=True)
            self.factory.reactor.callLater(1, hello)

        # start sending messages every second ..
        hello()

    def onMessage(self, payload, isBinary):
        if isBinary:
            print("Binary message received: {0} bytes".format(len(payload)))
        else:
            print("Text message received: {0}".format(payload.decode('utf8')))

    def onClose(self, wasClean, code, reason):
        print("WebSocket connection closed: {0}".format(reason))


if __name__ == '__main__':

    import sys

    from twisted.python import log
    from twisted.internet import reactor

    print("1")

    log.startLogging(sys.stdout)

    print("2")

    factory = WebSocketClientFactory("ws://44.55.209.178/:9000", debug=True)
    factory.protocol = MyClientProtocol

    print("3")

    reactor.connectTCP("ws://44.55.209.178", 9000, factory)

    print("4")

    reactor.run()

    print("5")