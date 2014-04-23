#!/usr/bin/python

#----------------------------------------------------------------------

import datetime
import socket
import select
import json
import threading
import MySQLdb as mdb
from contextlib import closing

#----------------------------------------------------------------------
#
#----------------------------------------------------------------------

def date_handler(obj):
	return datetime.datetime.strftime(obj, "%Y-%m-%d %H:%M:%S") if isinstance(obj, datetime.datetime) else obj

def getJSON(dct):
	return json.dumps(dct, default=date_handler) if dct else None
#----------------------------------------------------------------------

def getCurrentTime():
	return datetime.datetime.strftime(datetime.datetime.now(), "%Y-%m-%d %H:%M:%S")

#----------------------------------------------------------------------

def getDaemonResponse(input):
	try:
		with closing(socket.socket()) as s:
			s.connect(("localhost", 32768))
			s.send(input)
			result = s.recv(256)
			return result

	except socket.error, (value, message):
		print "socket error: " + message
		return None

#----------------------------------------------------------------------

def getScore(board):
	return getDaemonResponse('b' + board) if len(board) == 35 else -1

#----------------------------------------------------------------------

def getBoard(seed):
	return getDaemonResponse("s" + str(seed))

#----------------------------------------------------------------------
# Handler
#----------------------------------------------------------------------

class Handler(object):

	def __init__(self, form, channel, db):
		self.form = form
		self.channel = channel
		self.db = db

	#----------------------------------------------------------------------

	def getBoardID(self, fbid, gameID):
		with closing(self.db.cursor(mdb.cursors.DictCursor)) as cur:
			cur.execute("select board_id from boards where game_id=%s and facebook_id=%s", (gameID, fbid))
			board = cur.fetchone()
			if board:
				return board["board_id"]
		return None

	#----------------------------------------------------------------------

	def error(self, num, desc):
		try:
			self.channel.send(getJSON( { "error" : num, "errorDescription" : desc } ))
		except socket.error,e:
			print "outbound socket error..."

	#----------------------------------------------------------------------

	def getCurrentGame(self):
		with closing(self.db.cursor(mdb.cursors.DictCursor)) as cur:
			cur.execute("select game_id, random_seed, start_time, end_time from games order by game_id desc limit 1;")
			row = cur.fetchone()
			if row:
				row["current_time"] = datetime.datetime.now()
				row["board"] = getBoard(row["random_seed"])
			return row

#----------------------------------------------------------------------
# action:quit
#
# parameters:	none
#
# response:		result			string		// 'fine'
#----------------------------------------------------------------------

class quitHandler(Handler):

	def handle(self):
		self.channel.send(getJSON({"result": "fine"}))
		return True # end this thread - release dbase connection etc

#----------------------------------------------------------------------
# action:ping
#
# parameters:	none
#
# response:		result			string		// 'pong'
#----------------------------------------------------------------------

class pingHandler(Handler):

	def handle(self):
		self.channel.send(getJSON({"result": "pong"}))
		
#----------------------------------------------------------------------
# action:game
#
# parameters:	none
#
# response:		game_id			int			// current game_id
#				random_seed		uint32		// random seed for current game
#				start_time		datetime	// start time for this game
#				end_time		datetime	// end time for this game
#				current_time	datetime	// current server time
#				board			char[35]	// board for this game
#----------------------------------------------------------------------

class gameHandler(Handler):

	def handle(self):
		game = self.getCurrentGame()
		if game:
			self.channel.send(getJSON(game))
		else:
			self.error(6, "No game!?")

#----------------------------------------------------------------------
# action:post
#
# parameters:	fbid:			uint64		// facebook_id
#				board			char[35]	// current board
#				gameid			int			// current game_id
#
# response:		score			int			// score of that board
#				board_id		int			// index into boards table
#				end_time		datetime	// when current game ends
#				current_time	datetime	// server time
#----------------------------------------------------------------------

class postHandler(Handler):

	def updateBoard(self, board, score, fbid, gameID):
		try:
			with closing(self.db.cursor(mdb.cursors.DictCursor)) as cur:
				sql = "update boards set board=%s, score=%s, time_stamp=%s where facebook_id=%s and game_id=%s;"
				updated = cur.execute(sql, (board, score, getCurrentTime(), fbid, gameID))
				if updated > 0:
					self.db.commit()
					cur.close()
					return self.getBoardID(fbid, gameID)
		except mdb.DatabaseError, e:
			pass
		return None

	#----------------------------------------------------------------------

	def insertNewBoard(self, board, score, fbid, gameID):
		try:
			with closing(self.db.cursor(mdb.cursors.DictCursor)) as cur:
				sql = "insert into boards (game_id, board, score, time_stamp, facebook_id) values (%s,%s,%s,%s,%s);"
				cur.execute (sql, (gameID, board, score, getCurrentTime(), fbid))
				return cur.lastrowid
		except mdb.DatabaseError, e:
			return None

	#----------------------------------------------------------------------

	def handle(self):
		try:
			board = self.form["board"]
			facebookID = self.form["fbid"]
			gameID = self.form["gameid"]
			game = self.getCurrentGame()
			if not game:
				self.error (6, "No game!?")
			elif int(gameID) != game["game_id"]:
				self.error (5, "Old gameID")
			elif game["current_time"] > game["end_time"]:
				self.error (4, "Game ended")
			else:
				score = getScore(board)
				if score > 0:
					id = self.updateBoard(board, score, facebookID, gameID)
					if not id:
						id = self.insertNewBoard(board, score, facebookID, gameID)
					if id:
						self.channel.send(getJSON(
							{
								"score": int(score),
								"board_id": int(id),
								"end_time": game["end_time"],
								"current_time": game["current_time"]
							}))
					else:
						self.error(7, "MySQL error")
				else:
					self.error(10, "Bad board")
		except ValueError, e:
			self.error (2, "Need board, fbid and gameid")

#----------------------------------------------------------------------
# ClientThread
#----------------------------------------------------------------------

class ClientThread(threading.Thread):

	#----------------------------------------------------------------------

	def __init__ (self, (channel, details)):
		self.db = None
		self.channel = channel
		self.details = details
		threading.Thread.__init__ (self)

	#----------------------------------------------------------------------

	def close(self):
		try:
			if self.channel:
				self.channel.close()
		finally:
			self.channel = None
		try:
			if self.db:
				self.db.close()
		finally:
			self.db = None
	
	#----------------------------------------------------------------------

	def error(self, num, desc):
		try:
			self.channel.send(getJSON( { "error" : num, "errorDescription" : desc } ))
		except socket.error,e:
			print "outbound socket error..."

	#----------------------------------------------------------------------

	def run (self):
		try:
			self.db = mdb.connect('localhost', 'mtw-user', 'henry1', 'mtw')
			self.db.autocommit(True)
			while(True):
				form = json.loads(self.channel.recv(4096))
				print "(" + str(threading.activeCount()) + ") %s from " % form["action"] + str(self.details) + " at " + str(datetime.datetime.now())
				if not globals()[form["action"] + "Handler"](form, self.channel, self.db).handle():
					ready = select.select([self.channel], [], [], 60 * 10)
					if not ready[0]:
						break
				else:
					break
		except socket.error, e: self.error(10, "Socket error")
		except ValueError: self.error(3, "JSON error")
		except mdb.Error, e:
			print "Database error %d: %s" % (e.args[0], e.args[1])
			self.error(8, "database busy")
		finally: self.close()

#----------------------------------------------------------------------
# main
#----------------------------------------------------------------------

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.bind(('', 32000))
server.listen(5)
receiveList = [server]
print "Listening..."
while True:
	ready = select.select(receiveList, [], [], 100)
	if ready[0]:
		ClientThread(server.accept()).start()
