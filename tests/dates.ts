import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import StreamTester from 'streamtester'
import csvnorm from '../source/index.js'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const testsDir = path.resolve(currentDir, '../../tests')

let buffer = Buffer.alloc(0)
const streamTester = new StreamTester({
  test: (chunk: Buffer) => {
    buffer = Buffer.concat([buffer, chunk])
  },
})

streamTester.on('finish', () => {
  const expected = Buffer.from([
    'Name,Date',
    'John,2019-04-03',
    'Marc,0090-12-28',
    '',
  ].join('\n'))
  assert.equal(buffer.toString(), expected.toString())
  console.info(' ✔︎')
})

process.stdout.write('Format all dates in ISO8601 format')

csvnorm({
  isoDatetime: true,
  readableStream: fs.createReadStream(
    path.join(testsDir, 'dates.csv'),
  ),
  writableStream: streamTester,
})
