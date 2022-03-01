#include <NodeSerialDesc.h>
#include <SoftwareSerial.h>

#define REGISTER_RELAY_VALUE_ADDRESS                  200
#define REGISTER_RELAY_COUNT_ADDRESS                  201
#define REGISTER_RELAY_FEEDBACK_ADDRESS               202

#define DEVICE_FAMILY 1
#define DEVICE_TYPE   258

typedef struct {
  uint16_t  value;
  uint16_t  reserved;
} relay_value_t;

typedef struct {
  uint16_t  value;
  uint16_t  reserved;
} relay_count_t;

typedef struct {
  uint16_t  value;
  uint16_t  reserved;
} relay_feedback_t;

uint8_t itterate_serial(void);
int     get_config_registor(unsigned char* buff_tx, int len_tx, unsigned char* buff_rx, int len_rx);
int     set_config_registor(unsigned char* buff_tx, int len_tx, unsigned char* buff_rx, int len_rx);
int     get_basic_sensor_value(unsigned char* buff_tx, int len_tx, unsigned char* buff_rx, int len_rx);
int     set_basic_sensor_value(unsigned char* buff_tx, int len_tx, unsigned char* buff_rx, int len_rx);

SoftwareSerial debug_serial(2, 3);
uint16_t g_relay_value            = 10;
uint16_t g_relay_feedback_value   = 11;
uint16_t g_relay_count            = 4;
uint8_t  g_relay_offset           = 5;

commands_table_t handlers_map[] = {
  { OPCODE_GET_CONFIG_REGISTER,     get_config_registor },
  { OPCODE_SET_CONFIG_REGISTER,     set_config_registor },
  { OPCODE_GET_BASIC_SENSOR_VALUE,  get_basic_sensor_value },
  { OPCODE_SET_BASIC_SENSOR_VALUE,  set_basic_sensor_value }
};

uint8_t itterate_serial(void) {
  int len = 0;
  if (read_serial_buffer()) {
    handler_serial(handlers_map, SERIAL_COMMAND_TABLE_SIZE);
    return 1;
  }

  return 0;
}

void setup() {
  Serial.begin(115200);
  delay(10);
  debug_serial.begin(9600);
  
  Serial.println("Loading Firmware ... [Node]");
  Serial.println("Done.");
  debug_serial.println("Loading DEBUG module.");

  for (uint8_t relay = 0; relay < g_relay_count; relay++) {
    pinMode(g_relay_offset + relay, OUTPUT);
    digitalWrite(g_relay_offset + relay, HIGH);
  }
}

void loop() {
  itterate_serial();
  delay(10);
}

int get_config_registor(unsigned char* buff_tx, int len_tx, unsigned char* buff_rx, int len_rx) {
  node_register_t* reg_tx = (node_register_t*)buff_tx;
  node_register_t* reg_rx = (node_register_t*)buff_rx;

  reg_tx->address = reg_rx->address;
  switch(reg_rx->address) {
    case REGISTER_DEVICE_TYPE_ADDRESS: {
      node_device_type_t* dev = (node_device_type_t *)&(reg_tx->value);
      dev->family = DEVICE_FAMILY;
      dev->type   = DEVICE_TYPE;
    }
    break;
    case REGISTER_RELAY_VALUE_ADDRESS: {
      relay_value_t* relay_arr = (relay_value_t *)&(reg_tx->value);
      relay_arr->value = g_relay_value;
    }
    break;
    case REGISTER_RELAY_COUNT_ADDRESS: {
      relay_count_t* counter = (relay_count_t *)&(reg_tx->value);
      counter->value = g_relay_count;
    }
    break;
    case REGISTER_RELAY_FEEDBACK_ADDRESS: {
      relay_feedback_t* feedback_arr = (relay_feedback_t *)&(reg_tx->value);
      feedback_arr->value = g_relay_feedback_value;
    }
    break;
    case REGISTER_NODE_IO_READ: {
      node_io_t* io = (node_io_t *)&(reg_tx->value);
    }
    break;
    case REGISTER_NODE_IO_WRITE: {
      node_io_t* io = (node_io_t *)&(reg_tx->value);
    }
    break;
    default:
    break;
  }

  return sizeof(node_register_t);
}

int set_config_registor(unsigned char* buff_tx, int len_tx, unsigned char* buff_rx, int len_rx) {
  node_register_t* reg_tx = (node_register_t*)buff_tx;
  node_register_t* reg_rx = (node_register_t*)buff_rx;

  debug_serial.println("get_config_registor");

  reg_tx->address = reg_rx->address;
  switch(reg_rx->address) {
    case REGISTER_RELAY_VALUE_ADDRESS: {
      relay_value_t* relay_arr_rx = (relay_value_t *)&(reg_rx->value);
      relay_value_t* relay_arr_tx = (relay_value_t *)&(reg_tx->value);

      g_relay_value = relay_arr_rx->value;
      relay_arr_tx->value = g_relay_value;
      set_relay_value();
    }
    break;
    case REGISTER_NODE_IO_WRITE: {
      node_io_t* io_rx = (node_io_t *)&(reg_rx->value);
      node_io_t* io_tx = (node_io_t *)&(reg_tx->value);
    }
    break;
    default:
    break;
  }

  return sizeof(node_register_t);
}

int get_basic_sensor_value(unsigned char* buff_tx, int len_tx, unsigned char* buff_rx, int len_rx) {
  return 0;
}

int set_basic_sensor_value(unsigned char* buff_tx, int len_tx, unsigned char* buff_rx, int len_rx) {
  return 0;
}

void set_relay_value(void) {
  for (uint8_t relay = 0; relay < g_relay_count; relay++) {
    digitalWrite(g_relay_offset + relay, 1-((g_relay_value >> relay) & 0x1));
  }
}
