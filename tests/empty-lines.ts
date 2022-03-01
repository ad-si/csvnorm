import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import StreamTester from 'streamtester'
import csvnorm from '../source/index.js'

const streamTester = new StreamTester()
const currentDir = path.dirname(fileURLToPath(import.meta.url))
const testsDir = path.resolve(currentDir, '../../tests')

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
