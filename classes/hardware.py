import struct
import time
from core import co_definitions
from core.mks import mks_uart_adaptor

class FirmwareDataConvert():
	def __init__(self):
		pass

	def DeviceTypeConvert(self, data):
		if len(data) != 8:
			return None

		return {
			"family": data[4],
			"type": data[6] << 8 | data[5]
		}
	
	def RelayFeedbackConvert(self, data):
		if len(data) != 8:
			return None

		return {
			"value": data[5] << 8 | data[4]
		}
	
	def RelayValueConvert(self, data):
		if len(data) != 8:
			return None

		return {
			"value": data[5] << 8 | data[4]
		}
	
	def RelayCountConvert(self, data):
		if len(data) != 8:
			return None

		return {
			"value": data[5] << 8 | data[4]
		}

class Firmware(co_definitions.ILayer):
	def __init__(self, path, baudrate):
		co_definitions.ILayer.__init__(self)
		self.Adaptor				= mks_uart_adaptor.Adaptor(path, baudrate)
		self.Locker					= None
		self.Status					= False
		self.FirmwareDataConverter 	= FirmwareDataConvert()

		self.Adaptor.OnSerialConnectedCallback			= None
		self.Adaptor.OnSerialDataArrivedCallback		= None
		self.Adaptor.OnSerialAsyncDataCallback			= None
		self.Adaptor.OnSerialErrorCallback				= None
		self.Adaptor.OnSerialConnectionClosedCallback	= None

		self.OPCODE_GET_CONFIG_REGISTER					= 11
		self.OPCODE_SET_CONFIG_REGISTER					= 12
		self.OPCODE_GET_BASIC_SENSOR_VALUE				= 13
		self.OPCODE_SET_BASIC_SENSOR_VALUE				= 14

		self.REGISTER_DEVICE_TYPE_ADDRESS				= 100
		self.REGISTER_NODE_IO_READ						= 101
		self.REGISTER_NODE_IO_WRITE						= 102

		self.REGISTER_RELAY_VALUE_ADDRESS				= 200
		self.REGISTER_RELAY_COUNT_ADDRESS				= 201
		self.REGISTER_RELAY_FEEDBACK_ADDRESS			= 202

		self.SYNC_REQUEST								= 1
		self.SYNC_RESPONSE								= 2
		self.ASYNC										= 3

		self.TranslatorMap = {
			self.REGISTER_DEVICE_TYPE_ADDRESS: 		self.FirmwareDataConverter.DeviceTypeConvert,
			self.REGISTER_RELAY_FEEDBACK_ADDRESS: 	self.FirmwareDataConverter.RelayFeedbackConvert,
			self.REGISTER_RELAY_VALUE_ADDRESS: 		self.FirmwareDataConverter.RelayValueConvert,
			self.REGISTER_RELAY_COUNT_ADDRESS: 		self.FirmwareDataConverter.RelayCountConvert
		}

	def Connect(self):		
		self.Status = self.Adaptor.Connect(3)
		return self.Status
	
	def Disconnect(self):
		self.Adaptor.Disconnect()
	
	def GetConfigRegistor(self, address):
		value 			= 0
		content_length 	= 5

		if self.Status is False:
			return None

		data = struct.pack("<BBBBBBIBB", 0xDE, 0xAD, self.SYNC_REQUEST, self.OPCODE_GET_CONFIG_REGISTER, content_length, address, value, 0xAD, 0xDE)
		ret_data = self.RetrySend(data)
		
		if len(ret_data) != 8:
			return None
		
		register_address = ret_data[3]
		return self.TranslatorMap[register_address](ret_data)
	
	def SetConfigRegistor(self, address, value):
		content_length 	= 5

		if self.Status is False:
			return None

		data = struct.pack("<BBBBBBIBB", 0xDE, 0xAD, self.SYNC_REQUEST, self.OPCODE_SET_CONFIG_REGISTER, content_length, address, value, 0xAD, 0xDE)
		ret_data = self.RetrySend(data)
		
		if len(ret_data) != 8:
			return None
		
		register_address = ret_data[3]
		return self.TranslatorMap[register_address](ret_data)

	def GetBasicSensorValue(self):
		pass

	def SetBasicSensorValue(self):
		pass

	def RetrySend(self, data):
		retry = 3
		while (retry):
			ret_data = self.Adaptor.Send(data)
			if len(ret_data) == 8:
				return ret_data
			retry -= 1
			time.sleep(0.1)
		return []
