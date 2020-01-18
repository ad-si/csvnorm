import assert from 'assert'
import fs from 'fs'
import path from 'path'

import StreamTester from 'streamtester'
import csvnorm from '../source/index'

const testsDir = path.resolve(__dirname, '../../tests')

let buffer = Buffer.alloc(0)
const streamTester = new StreamTester({
  test: (chunk: Buffer) => {
    buffer = Buffer.concat([buffer, chunk])
  },
})

streamTester.on('finish', () => {
  const expected = Buffer.from([
    'Recipient,Date',
    'John,2014-03-24T14:56:00.000Z',
    'Anna,2017-08-29T17:23:00.000Z',
    'Ben,2018-02-17T09:17:00.000Z',
    'Lisa,2019-04-16T19:34:00.000Z',
    'Tom,2019-04-16T19:34:00.000Z',
    'Ella,2019-04-16T21:34+02',
    '',
  ].join('\n'))
  assert.equal(buffer.toString(), expected.toString())
  console.info(' ✔︎')
})

process.stdout.write('Format all datetimes in ISO8601 format')

csvnorm({
  isoDatetime: true,
  readableStream: fs.createReadStream(
    path.join(testsDir, 'banking/datetimes.csv'),
  ),
  writableStream: streamTester,
})
