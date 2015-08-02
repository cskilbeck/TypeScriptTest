import logging, logging.handlers

class logger(object):
    
    def __init__(self, level = logging.DEBUG)
        self.logger = logging.getLogger('')
        self.logger.setLevel(level)
        self.socketHandler = logging.handlers.SocketHandler('localhost', logging.handlers.DEFAULT_TCP_LOGGING_PORT)
        self.logger.addHandler(self.socketHandler)

    def output(self, fn, x, y = ""):
        x = str(x).replace("\\n", "\n")
        if type(y) is not str:
            y = pprint.pformat(y, 0, 120).replace("\\n", "\n")
        fn(x + y + '\n')

    def debug(self, x, y = ""):
        output(logging.debug, x, y)

    def info(self, x, y = ""):
        output(logging.info, x, y)

    def warn(self, x, y = ""):
        output(logging.warn, x, y)