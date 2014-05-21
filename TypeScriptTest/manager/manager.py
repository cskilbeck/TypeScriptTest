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
from dbaseconfig import *

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

def formattedTime(t):
    return datetime.datetime.strftime(t, "%Y-%m-%d %H:%M:%S.%f")

# sit in a loop, sleeping
# now and again:
#     connect to the database
#     create a new game