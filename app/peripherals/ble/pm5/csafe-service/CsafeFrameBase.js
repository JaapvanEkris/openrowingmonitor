'use strict'

import { PublicLongCommands, UniqueFrameFlags } from './CsafeCommandsMapping.js'

export class CsafeFrameBase {
  /**
   * Check if the command is C2 proprietary or public.
   * @param {number} command
   */
  static isProprietary (command) {
    return command === PublicLongCommands.CSAFE_SETPMCFG_CMD ||
        command === PublicLongCommands.CSAFE_SETPMDATA_CMD ||
        command === PublicLongCommands.CSAFE_GETPMCFG_CMD ||
        command === PublicLongCommands.CSAFE_GETPMDATA_CMD
  }

  /**
   * @param {number} byte
   */
  static shouldStuffByte (byte) {
    return (byte & 0xFC) === 0xF0
  }

  /**
   * @param {number} flag
   * @param {number} byte
   */
  static shouldUnStuffByte (flag, byte) {
    return flag === UniqueFrameFlags.StuffFlag && (byte & 0xFC) === 0
  }

  /**
   * Returns the offset byte value for byte stuffing.
   * @param {number} byte
   */
  static stuffByte (byte) {
    return [0xF3, byte & 0x03]
  }

  /**
   * Returns the real byte value for a stuffed byte.
   * @param {number} byte
   */
  static unStuffByte (byte) {
    return byte + 0xF0
  }

  /**
   * Generates a 1 byte XOR checksum for a byte array.
   * @param {Array<number>} bytes
   */
  static checksumFromBytes (bytes) {
    return bytes.reduce((checkSum, byte) => checkSum ^ byte, 0x00)
  }
}
