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
    'id,lastname,firstname,calculation',
    '32,Schlink,Jon,123+456',
    '51,Wood,Brian,456-123',
    '34,Tapion,Mikko,123.456+123.456',
    '73,Arms,Paul,987.654-123.456',
    '',
  ].join('\n'))
  assert.equal(buffer.toString(), expected.toString())
  console.info(' ✔︎')
})

process.stdout.write('Parse CSV file with calculations')

csvnorm({
  encoding: 'utf-8',  // TODO: This should not be necessary
  readableStream: fs.createReadStream(
    path.join(testsDir, 'banking/calculations.csv'),
  ),
  writableStream: streamTester,
})
