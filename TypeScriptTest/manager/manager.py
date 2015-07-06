#!/usr/bin/env python
"""
Game Manager

Run it periodically with cron
It creates a new game in the games table
The seed will be the seed of the most recent game + 1 (or 1 if there are no previous games)
Defaults to a 1 day game length, override with a numeric parameter specified in minutes, so 1440 for a 1 day game
"""

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
from time import sleep

sys.path.append('/usr/local/www/wsgi-scripts')
os.chdir('/usr/local/www/wsgi-scripts')
from dbaseconfig import *

def open_database():
    conn = mdb.connect( host        = db_host(),
                        user        = db_user(),
                        passwd      = db_password(),
                        db          = db_db(),
                        use_unicode = True,
                        cursorclass = MySQLdb.cursors.DictCursor,
                        charset     = 'utf8')
    conn.autocommit(True)
    return conn

def main():
    print "@--"
    print "Game Manager begins at " + str(datetime.datetime.now())
    minutes = int(sys.argv[2]) if len(sys.argv) > 2 else 1440
    print "Creating game of " + str(minutes) + " length"
    print "Opening database " + db_db() + " on " + db_host() + " with username " + db_user()
    with closing(open_database()) as db:
        print "Database is open"
        with closing(db.cursor()) as cur:
            print "Got cursor"
            cur.execute("SELECT * FROM games ORDER BY end_time DESC LIMIT 1")
            row = cur.fetchone()
            seed = 1
            if row is not None:
                print "previous seed was " + str(row['seed'])
                seed = row['seed'] + 1
            timestamp = datetime.datetime.now()
            start_time = timestamp.isoformat()
            end_time = (timestamp + datetime.timedelta(minutes = minutes)).isoformat()
            print "New seed: " + str(seed) + ", start_time: " + start_time + ", end_time: " + end_time
            cur.execute("INSERT INTO games (seed, start_time, end_time) VALUES (%(seed)s, %(start_time)s, %(end_time)s)", locals());
            print "Inserted, game_id: " + str(db.insert_id())
    print "--@"

if __name__ == "__main__":
    main()
