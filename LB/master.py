#!/usr/bin/python

import MySQLdb as mdb
import time
from datetime import datetime, timedelta
import random
import socket
from contextlib import closing
import urllib, urllib2
from pprint import pprint

dtf = "%Y-%m-%d %H:%M:%S"

#----------------------------------------------------------------------

def seconds(td):
	return td.days * 86400 + td.seconds

#----------------------------------------------------------------------

def opendb():
	return  mdb.connect(	host		= 'mtwdbinstance.cnk16j9pzvyy.us-east-1.rds.amazonaws.com',
							user		= 'mtwuser',
							passwd		= 'Henry123',
							db			= 'mtwdb',
							use_unicode	= True,
							charset		= 'utf8')
				
#----------------------------------------------------------------------

def getNewSeed():
	try:
		with closing(socket.socket()) as s:
			s.connect(("localhost", 32768))
			s.send('r')
			result = s.recv(256)
			return int(result)
		
	except socket.error, (value, message):
		print "socket error: " + message

#----------------------------------------------------------------------

def getCurrentGame(db):
	with closing(db.cursor(mdb.cursors.DictCursor)) as cur:
		rows = cur.execute("select random_seed, start_time, end_time, game_id from games order by game_id desc limit 1;")
		return cur.fetchone() if rows > 0 else None

#----------------------------------------------------------------------

def createNewGame(db, seed, startTime, endTime):
	with closing(db.cursor(mdb.cursors.DictCursor)) as cur:
		cur.execute("insert into games (random_seed, start_time, end_time) values (%s, %s, %s);", (seed, startTime, endTime))
		id = cur.lastrowid
		db.commit()
		return id

#----------------------------------------------------------------------

def getJSONURL(path):
	try:
		return json.loads(urllib2.urlopen(urllib2.Request(path)).read())
	except:
		return None

#----------------------------------------------------------------------

def seconds(td):
	return td.days * 86400 + td.seconds

#----------------------------------------------------------------------
# main

gameTime = 5
idleTime = 2
settleTime = 1

with closing(opendb()) as db:
	db.autocommit(True)
	sleepTime = 0
	while(True):
		print "Sleeping for %d seconds" % (sleepTime)
		time.sleep(sleepTime)
		game = getCurrentGame(db)
		now = datetime.now()
		endTime = now
		if game:
			endTime = game["end_time"]
			print "Current game ends at " + str(endTime)
		newStartTime = endTime + timedelta(0, idleTime)
		if now > newStartTime:
			newStartTime = now
		newEndTime = newStartTime + timedelta(0, gameTime)
		id = createNewGame(db, getNewSeed(), newStartTime, newEndTime)
		print "Created a new game(%d), Start: %s, End: %s" % (id, newStartTime.strftime(dtf), newEndTime.strftime(dtf))
		sleepTime = seconds(newEndTime - datetime.now()) + settleTime + 1
