const fs = require('fs')
const path = require('path')
const assert = require('assert')

const csvnorm = require('..')
const StreamTester = require('streamtester')
const streamTester = new StreamTester({
  test: csvChunk => {
    const numberOfCommas = csvChunk
      .toString()
      .match(/,/g)
      .length
    assert.equal(numberOfCommas, 6)
  },
})

streamTester.on('finish', () => {
  console.info(' ✔︎')
})


process.stdout.write('Format banking CSV file via JavaScript API')

csvnorm({
  readableStream: fs.createReadStream(
    path.join(__dirname, 'banking/input-latin1.csv')
  ),
  writableStream: streamTester,
})
