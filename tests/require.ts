import assert from 'assert'
import fs from 'fs'
import path from 'path'

import StreamTester from 'streamtester'
import csvnorm from '../source/index'

const testsDir = path.resolve(__dirname, '../../tests')
const streamTester = new StreamTester({
  test: (csvChunk: string) => {
    const match = csvChunk
      .toString()
      .match(/,/g)
    const numberOfCommas = match
      ? match.length
      : 0
    assert.equal(numberOfCommas, 6)
  },
})

streamTester.on('finish', () => {
  console.info(' ✔︎')
})

process.stdout.write('Format banking CSV file via JavaScript API')

csvnorm({
  readableStream: fs.createReadStream(
    path.join(testsDir, 'banking/input-latin1.csv'),
  ),
  writableStream: streamTester,
})
