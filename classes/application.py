import imp
import os
import json
import time
import _thread

from core import co_application
from core import co_multicaster
from core import co_udp_broadcast
from core import co_beaconer
from core import co_json_db
from classes import hardware
from core import co_logger

class Application(co_application.ApplicationLayer):
	def __init__(self):
		co_application.ApplicationLayer.__init__(self)
        # REST Handlers
		self.WSHandlers["echo"] 				= self.EchoHandler
		self.WSHandlers["set_relay_value"]		= self.SetRelayValueHandler
		self.WSHandlers["get_relay_value"]		= self.GetRelayValueHandler
		self.WSHandlers["get_relay_feedback"]	= self.GetRelayFeedbackHandler
		self.WSHandlers["get_relay_count"]		= self.GetRelayCountHandler
		self.WSHandlers["set_relay_name"]		= self.SetRelayNameHandler
		self.WSHandlers["get_relay_name"]		= self.GetRelayNameHandler

		self.Working 					= False
		self.ErrorCallback 				= None

		self.Users 						= co_beaconer.Beaconer(co_udp_broadcast.UDPBroadcaster())
		self.Users.UserEventsCallback 	= self.UsersEventHandler

		self.HW							= hardware.Firmware("COM13", 115200)
		self.HW.Connect()

		self.DeviceType = self.HW.GetConfigRegistor(self.HW.REGISTER_DEVICE_TYPE_ADDRESS)["type"]
		self.RelayCount = self.HW.GetConfigRegistor(self.HW.REGISTER_RELAY_COUNT_ADDRESS)["value"]
		self.RelayValue = self.HW.GetConfigRegistor(self.HW.REGISTER_RELAY_VALUE_ADDRESS)["value"]

		self.DB	= co_json_db.DB()
		status = self.DB.Load("switcher.json")
		if status is False:
			self.DB.CreateDatabase("switcher.json")
		
		data = self.DB.GetTable("switches")
		if data is None:
			self.DB.AppendTable("switches")
			for idx in range(self.RelayCount):
				self.DB.AppendRowToTable("switches", {
					"idx": idx,
					"name": "Switch",
					"value": 0
				})
			self.DB.Save()
		else:
			if len(data) != self.RelayCount:
				# Delete table and create new items
				pass
		
		self.RelayValue = 0
		for item in self.DB.GetTable("switches"):
			self.RelayValue |= item["value"] << item["idx"]
		
		self.HW.SetConfigRegistor(self.HW.REGISTER_RELAY_VALUE_ADDRESS, self.RelayValue)
	
	def WebErrorEvent(self):
		self.FatalError = True
		if self.ErrorCallback is not None:
			self.ErrorCallback()
	
	def UsersEventHandler(self, name, info):
		co_logger.LOGGER.Log("(UsersEventHandler)# {0}".format(name), 1)
	
	def Worker(self):
		self.Working = True

		# Nodes live database
		self.Users.Run()
		while self.Working is True:
			try:
				time.sleep(5)
			except Exception as e:
				co_logger.LOGGER.Log("Worker Exception: {0}".format(e), 1)
	
	def EchoHandler(self, sock, packet):
		co_logger.LOGGER.Log("EchoHandler {0}".format(packet), 1)
		is_async = packet["payload"]["async"]
		
		if is_async is True:
			return "Echo ASYNC"
		else:
			return "Echo SYNC"
	
	def SetRelayValueHandler(self, sock, packet):
		co_logger.LOGGER.Log("SetRelayValueHandler {0}".format(packet), 1)
		value = packet["payload"]["value"]

		if self.HW.Status is False:
			return {
				"error": "Device not connected"
			}

		relay = self.HW.SetConfigRegistor(self.HW.REGISTER_RELAY_VALUE_ADDRESS, value)
		if relay is not None:
			for idx in range(self.RelayCount):
				relay_state = ((value >> idx) & 1)
				self.DB.UpdateRow("switches", idx+1, "value", relay_state)
			
			self.DB.Save()
			self.RelayValue = relay["value"]
		else:
			return {
				"value": self.RelayValue
			}
		
		return relay
	
	def GetRelayValueHandler(self, sock, packet):
		co_logger.LOGGER.Log("GetRelayValueHandler {0}".format(packet), 1)

		if self.HW.Status is False:
			return {
				"error": "Device not connected"
			}
		
		return self.HW.GetConfigRegistor(self.HW.REGISTER_RELAY_VALUE_ADDRESS)
	
	def GetRelayFeedbackHandler(self, sock, packet):
		co_logger.LOGGER.Log("GetRelayFeedbackHandler {0}".format(packet), 1)

		if self.HW.Status is False:
			return {
				"error": "Device not connected"
			}
		
		return self.HW.GetConfigRegistor(self.HW.REGISTER_RELAY_FEEDBACK_ADDRESS)
	
	def GetRelayCountHandler(self, sock, packet):
		co_logger.LOGGER.Log("GetRelayCountHandler {0}".format(packet), 1)

		if self.HW.Status is False:
			return {
				"error": "Device not connected"
			}
		
		return self.HW.GetConfigRegistor(self.HW.REGISTER_RELAY_COUNT_ADDRESS)
	
	def SetRelayNameHandler(self, sock, packet):
		co_logger.LOGGER.Log("SetRelayNameHandler {0}".format(packet), 1)

		idx = int(packet["payload"]["idx"])
		name = packet["payload"]["name"]

		status = self.DB.UpdateRow("switches", idx+1, "name", name)
		self.DB.Save()

		return {
			"status": status
		}
	
	def GetRelayNameHandler(self, sock, packet):
		co_logger.LOGGER.Log("GetRelayNameHandler {0}".format(packet), 1)

		return {
			"switches": self.DB.GetTable("switches")
		}


