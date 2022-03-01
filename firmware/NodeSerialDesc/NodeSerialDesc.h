#ifndef NodeSerialDesc_h
#define NodeSerialDesc_h

#include "Arduino.h"

#define MAX_LENGTH 									                  64
#define MAX_COMMAND_TABLE_SIZE                        128
#define NODE_HEADER_SIZE                              5
#define SERIAL_COMMAND_TABLE_SIZE                     4

#define OPCODE_GET_CONFIG_REGISTER                    11
#define OPCODE_SET_CONFIG_REGISTER                    12
#define OPCODE_GET_BASIC_SENSOR_VALUE                 13
#define OPCODE_SET_BASIC_SENSOR_VALUE                 14

#define REGISTER_DEVICE_TYPE_ADDRESS                  100
#define REGISTER_NODE_IO_READ                         101
#define REGISTER_NODE_IO_WRITE                        102

#define SYNC_REQUEST                                  0x1
#define SYNC_RESPONSE                                 0x2
#define ASYNC                                         0x3

typedef int	(*SerialCallbackPtr)(unsigned char* buff_tx, int len_tx, unsigned char* buff_rx, int len_rx);

typedef struct {
  unsigned char     command;
  SerialCallbackPtr handler;
} commands_table_t;

typedef struct {
  unsigned char   magic_number[2];
  unsigned char   direction;
  unsigned char   op_code;
  unsigned char   content_length;
} node_header_t;

typedef struct {
  uint8_t   address;
  uint32_t  value;
} node_register_t;

typedef struct {
  unsigned char     type;
  unsigned short    value;
} node_sensor_t;

typedef struct {
  uint8_t     family;
  uint16_t    type;
  uint8_t     reserved;
} node_device_type_t;

typedef struct {
  uint8_t   pin;
  uint8_t   direction;
  uint16_t  value;
} node_io_t;

void blink(unsigned int interval);
int read_serial_buffer();
void handler_serial(commands_table_t* handler_table, uint8_t length);
unsigned char find_handler_index(unsigned char command, commands_table_t* handler_table, uint8_t length);
void send_data_to_master(uint8_t opcode, uint8_t* payload, uint16_t size);
void send_async_data_to_uart(uint16_t opcode, uint8_t* payload, uint16_t size);
#endif
