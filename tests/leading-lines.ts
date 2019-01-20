import * as assert from 'assert'
import * as fs from 'fs'
import * as path from 'path'

import * as StreamTester from 'streamtester'
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
    'Date,Recipient,Amount',
    '2014-12-01,Jöhn,10 $',
    '2017-08-13,Annä,7 $',
    '2018-02-22,Ben 🤠,166 $',
    '',
  ].join('\n'))
  assert.equal(buffer.toString(), expected.toString())
})

process.stdout.write('Parse CSV file with preceding lines')

csvnorm({
  encoding: 'utf-8',  // TODO: This should not be necessary
  readableStream: fs.createReadStream(
    path.join(testsDir, 'banking/leading-lines.csv'),
  ),
  // skipLinesEnd: 4,
  skipLinesStart: 5,
  writableStream: streamTester,
})
