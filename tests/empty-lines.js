const fs = require('fs')
const path = require('path')
const assert = require('assert')
const {exec} = require('child_process')

const csvnorm = require('..')
const StreamTester = require('streamtester')
const streamTester = new StreamTester()

streamTester.on('finish', () => {
  console.info(' ✔︎')
})

process.stdout.write('Format banking CSV file with emtpy lines')

csvnorm({
  readableStream: fs.createReadStream(
    path.join(__dirname, 'banking/input-utf-16-le-empty-line.csv')
  ),
  writableStream: streamTester,
})
