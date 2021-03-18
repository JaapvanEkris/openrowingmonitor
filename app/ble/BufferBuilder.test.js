'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor
*/
import test from 'ava'
import BufferBuilder from './BufferBuilder.js'
import log from 'loglevel'
log.setLevel(log.levels.SILENT)

test('valid max UInts should produce correct buffer', t => {
  const buffer = new BufferBuilder()
  buffer.writeUInt8(255)
  buffer.writeUInt16LE(65535)
  buffer.writeUInt24LE(16777215)
  t.deepEqual(buffer.getBuffer(), Buffer.from([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]))
})

test('valid min UInts should produce correct buffer', t => {
  const buffer = new BufferBuilder()
  buffer.writeUInt8(0)
  buffer.writeUInt16LE(0)
  buffer.writeUInt24LE(0)
  t.deepEqual(buffer.getBuffer(), Buffer.from([0x0, 0x0, 0x0, 0x0, 0x0, 0x0]))
})

test('negative UInt8 should produce 1 bit buffer of 0x0', t => {
  const buffer = new BufferBuilder()
  buffer.writeUInt8(-1)
  t.deepEqual(buffer.getBuffer(), Buffer.from([0x0]))
})

test('negative UInt16LE should produce 2 bit buffer of 0x0', t => {
  const buffer = new BufferBuilder()
  buffer.writeUInt16LE(-1)
  t.deepEqual(buffer.getBuffer(), Buffer.from([0x0, 0x0]))
})

test('negative writeUInt24LE should produce 3 bit buffer of 0x0', t => {
  const buffer = new BufferBuilder()
  buffer.writeUInt24LE(-1)
  t.deepEqual(buffer.getBuffer(), Buffer.from([0x0, 0x0, 0x0]))
})

test('invalid datatype value UInt16LE should produce 2 bit buffer of 0x0', t => {
  const buffer = new BufferBuilder()
  buffer.writeUInt16LE(new Map())
  t.deepEqual(buffer.getBuffer(), Buffer.from([0x0, 0x0]))
})
