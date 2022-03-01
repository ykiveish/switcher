#include "NodeSerialDesc.h"

unsigned char uart_tx_buffer[MAX_LENGTH];
unsigned char uart_rx_buffer[MAX_LENGTH];

int serial_rx_len = 0;
int serial_tx_len = 0;

void blink(unsigned int interval) {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(interval);
  digitalWrite(LED_BUILTIN, LOW);
  delay(interval);
}

void send_async_data_to_uart(uint16_t opcode, uint8_t* payload, uint16_t size) {
  node_header_t* uart_tx_header = (node_header_t *)(&uart_tx_buffer[0]);

  uart_tx_header->magic_number[0] = 0xDE;
  uart_tx_header->magic_number[1] = 0xAD;
  uart_tx_header->direction       = ASYNC;
  uart_tx_header->op_code         = opcode;
  uart_tx_header->content_length  = size;
  serial_tx_len                   = NODE_HEADER_SIZE + size;

  memcpy(&uart_tx_buffer[NODE_HEADER_SIZE], payload, size);

  uart_tx_buffer[serial_tx_len]     = 0xAD;
  uart_tx_buffer[serial_tx_len + 1] = 0xDE;
  Serial.write(&uart_tx_buffer[0], serial_tx_len + 2);
}

void handler_serial(commands_table_t* handler_table, uint8_t length) {
  node_header_t* uart_rx_header = (node_header_t *)(&uart_rx_buffer[0]);
  node_header_t* uart_tx_header = (node_header_t *)(&uart_tx_buffer[0]);
  uint8_t handler_size = 0;

	if (uart_rx_buffer[0] != 0xDE || uart_rx_buffer[1] != 0xAD) {
    uart_rx_buffer[serial_rx_len] = '\n';
    Serial.write(&uart_rx_buffer[0], serial_rx_len + 1);
  } else {
    uart_tx_header->magic_number[0] = 0xDE;
    uart_tx_header->magic_number[1] = 0xAD;
    uart_tx_header->direction       = SYNC_RESPONSE;
    uart_tx_header->op_code         = uart_rx_header->op_code;

    unsigned char index = find_handler_index(uart_rx_header->op_code, handler_table, length);
    if (index != 0xff) {
      handler_size = handler_table[index].handler(&uart_tx_buffer[NODE_HEADER_SIZE], MAX_LENGTH - NODE_HEADER_SIZE, &uart_rx_buffer[NODE_HEADER_SIZE], uart_rx_header->content_length);
    }

    uart_tx_header->content_length  = handler_size;
    serial_tx_len                   = NODE_HEADER_SIZE + handler_size;
    
    switch (uart_rx_header->op_code) {
      case OPCODE_GET_CONFIG_REGISTER:
      case OPCODE_SET_CONFIG_REGISTER:
      case OPCODE_GET_BASIC_SENSOR_VALUE:
      case OPCODE_SET_BASIC_SENSOR_VALUE:
        uart_tx_buffer[serial_tx_len]     = 0xAD;
        uart_tx_buffer[serial_tx_len + 1] = 0xDE;
        Serial.write(&uart_tx_buffer[0], serial_tx_len + 2);
      break;
      default: {
        uart_rx_buffer[serial_rx_len] = '\n';
        Serial.write(&uart_rx_buffer[0], serial_rx_len + 1);
      }
      break;
    }
  }
}

int read_serial_buffer() {
  if (Serial.available() > 0) {
    delay(10);
    serial_rx_len = Serial.readBytesUntil('\n', uart_rx_buffer, MAX_LENGTH);
    // Serial.flush();
  } else {
    serial_rx_len = 0;
  }

  return serial_rx_len;
}

unsigned char find_handler_index(unsigned char command, commands_table_t* handler_table, uint8_t length) {
  if (length > MAX_COMMAND_TABLE_SIZE) {
    return 0xff;
  }

  for (unsigned char idx = 0; idx < length; idx++) {
    if (handler_table[idx].command == command) {
      return idx;
    }
  }

  return 0xff;
}

void send_data_to_master(uint8_t opcode, uint8_t* payload, uint16_t size) {
  node_header_t* uart_tx_header = (node_header_t *)(&uart_tx_buffer[0]);
  uart_tx_header->magic_number[0] = 0xDE;
  uart_tx_header->magic_number[1] = 0xAD;
  uart_tx_header->direction       = SYNC_RESPONSE;
  uart_tx_header->op_code         = opcode;
  uart_tx_header->content_length  = size;
  serial_tx_len                   = NODE_HEADER_SIZE + size;

  memcpy(&uart_tx_buffer[NODE_HEADER_SIZE], payload, size);

  uart_tx_buffer[serial_tx_len]     = 0xAD;
  uart_tx_buffer[serial_tx_len + 1] = 0xDE;
  Serial.write(&uart_tx_buffer[0], serial_tx_len + 2);
}