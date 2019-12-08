import * as fs from 'fs'
import * as path from 'path'

import * as StreamTester from 'streamtester'
import csvnorm from '../source/index'

const streamTester = new StreamTester()
const testsDir = path.resolve(__dirname, '../../tests')

streamTester.on('finish', () => {
  console.info(' ✔︎')
})

process.stdout.write('Format banking CSV file with empty lines')

csvnorm({
  readableStream: fs.createReadStream(
    path.join(testsDir, 'banking/input-utf-16-le-empty-line.csv'),
  ),
  writableStream: streamTester,
})
