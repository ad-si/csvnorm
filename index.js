const fs = require('fs')
const stream = require('stream')

const csvParse = require('csv-parse')
const csvStringify = require('csv-stringify')
const jschardet = require('jschardet')
const iconv = require('iconv-lite')


module.exports = (options = {}) => {
  const {
    readableStream,
    writableStream,
    filePath,
  } = options
  const config = {}
  const delimiterHistogram = {
    ',': 0,
    ';': 0,
    '\t': 0,
    '|': 0,
  }

  class ConfigGenerator extends stream.Transform {
    constructor (opts) {
      super(opts)
    }

    _transform (chunk, chunkEncoding, chunkIsProcessedCb) {
      if (!config.encoding) {
        Object.assign(config, jschardet.detect(chunk))
      }

      for (
        let charIndex = 0;
        charIndex < chunk.length;
        charIndex++
      ) {
        const char = chunk.toString()[charIndex]

        if (delimiterHistogram.hasOwnProperty(char)) {
          delimiterHistogram[char]++
        }
      }

      this.push(chunk)
      chunkIsProcessedCb()
    }
  }

  const configGenerator = new ConfigGenerator()

  configGenerator.on('finish', () => {
    const mostFrequentDelimter = Array
      .from(Object.entries(delimiterHistogram))
      .sort((itemA, itemB) =>
        itemB[1] - itemA[1]
      )[0][0] // [first entry of delimiter list][key of entry]

    const parser = csvParse({delimiter: mostFrequentDelimter})
    parser.on('error', console.error)

    const stringifier = csvStringify({delimiter: '\t'})
    stringifier.on('error', console.error)

    fs
      .createReadStream(filePath)
      .pipe(iconv.decodeStream(config.encoding))
      .pipe(parser)
      .pipe(stringifier)
      .pipe(process.stdout)
  })

  if (filePath) {
    fs
      .createReadStream(filePath)
      .pipe(configGenerator)
  }
  else {
    const parser = csvParse()
    const stringifier = csvStringify()

    readableStream
      .pipe(parser)
      .pipe(stringifier)
      .pipe(writableStream)
  }
}
