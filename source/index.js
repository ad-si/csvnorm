const fs = require('fs')
const path = require('path')
const assert = require('assert')
const stream = require('stream')

const csvParse = require('csv-parse')
const csvStringify = require('csv-stringify')
const tempfile = require('tempfile')
const Formatter = require('./Formatter')
const toUtf8 = require('to-utf-8')

function printCsv (options = {}) {
  const {
    configGenerator,
    inputFilePath,
    writableStream,
  } = options

  const formatter = new Formatter()
  const parser = csvParse({
    delimiter: configGenerator.mostFrequentDelimter,
  })
  parser.on('error', console.error)

  const stringifier = csvStringify()
  stringifier.on('error', console.error)

  fs
    .createReadStream(inputFilePath)
    .pipe(toUtf8())
    .pipe(parser)
    .pipe(formatter)
    .pipe(stringifier)
    .pipe(writableStream || process.stdout)
}


module.exports = (options = {}) => {
  const {
    filePath,
    inPlace,
    readableStream,
  } = options
  let {writableStream} = options


  class ConfigGenerator extends stream.Writable {
    constructor (opts) {
      super(opts)
      this.delimiterHistogram = {
        ',': 0,
        ';': 0,
        '\t': 0,
        '|': 0,
      }
    }

    _write (chunk, chunkEncoding, chunkIsProcessedCb) {
      for (
        let charIndex = 0;
        charIndex < chunk.length;
        charIndex++
      ) {
        const char = chunk.toString()[charIndex]

        if (this.delimiterHistogram.hasOwnProperty(char)) {
          this.delimiterHistogram[char]++
        }
      }

      chunkIsProcessedCb()
    }

    _final (done) {
      this.mostFrequentDelimter = Array
        .from(Object.entries(this.delimiterHistogram))
        .sort((itemA, itemB) =>
          itemB[1] - itemA[1]
        )[0][0] // [first entry of delimiter list][key of entry]
      done()
    }
  }

  const configGenerator = new ConfigGenerator()


  if (filePath) {
    assert(path.isAbsolute(filePath))

    fs
      .createReadStream(filePath)
      .pipe(configGenerator)

    if (inPlace) {
      const temporaryFilePath = tempfile('.csv')
      writableStream = fs.createWriteStream(temporaryFilePath)
      writableStream.on('finish', () => {
        fs.rename(temporaryFilePath, filePath, console.error)
      })
    }

    configGenerator.on('finish', () => {
      printCsv({
        configGenerator,
        inputFilePath: filePath,
        writableStream,
      })
    })
    return
  }

  const temporaryFilePath = tempfile('.csv')
  const writableTempFile = fs.createWriteStream(temporaryFilePath)
  let firstStreamFinished = false

  function syncStreams () {
    if (!firstStreamFinished) {
      firstStreamFinished = true
      return
    }

    printCsv({
      configGenerator,
      inputFilePath: temporaryFilePath,
      writableStream,
    })
  }

  configGenerator.on('finish', syncStreams)
  readableStream
    .pipe(configGenerator)

  writableTempFile.on('finish', syncStreams)
  readableStream
    .pipe(writableTempFile)
}
