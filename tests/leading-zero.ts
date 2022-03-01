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
  const expected = Buffer.from(
    [
      'name,number',
      'john,1234',
      'lisa,0123',
      'marc,0012',
      'carl,+123',
      'mike,-123',
      'evan,+012',
      'jake,-012',
    ]
      .map((line) => line + '\n')
      .join(''),
  )
  assert.equal(buffer.toString(), expected.toString())
  console.info(' ✔︎')
})

process.stdout.write('Parse CSV file with leading zeros')

csvnorm({
  readableStream: fs.createReadStream(
    path.join(testsDir, 'leading-zeros.csv'),
  ),
  writableStream: streamTester,
})
