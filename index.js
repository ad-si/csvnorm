const fs = require('fs')
const path = require('path')
const assert = require('assert')
const stream = require('stream')

const csvParse = require('csv-parse')
const csvStringify = require('csv-stringify')
const jschardet = require('jschardet')
const iconv = require('iconv-lite')
const tempfile = require('tempfile')


function formatDate (value) {
  if (typeof value !== 'string') return null

  const mmddyyyy = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/
  if (mmddyyyy.test(value)) {
    console.error()
    return value.replace(mmddyyyy, '$3-$1-$2')
  }

  const ddmmyyyy = /^([0-9]{2})\.([0-9]{2})\.([0-9]{4})$/
  if (ddmmyyyy.test(value)) {
    return value.replace(ddmmyyyy, '$3-$2-$1')
  }

  const ddmmyy = /^([0-3][0-9])\.([01][1-9])\.([0-9]{2})$/
  if (ddmmyy.test(value)) {
    return value.replace(ddmmyy, '20$3-$2-$1')
  }
}

function formatNumber (value) {
  if (typeof value !== 'string') return null

  const containsANumber = /^[0-9+-.,]+$/.test(value)
  if (!containsANumber) return null

  const containsASeparator = /[.,]/.test(value)
  if (!containsASeparator) return Number(value)

  const containsOnlyThousands = /^[0-9]{1,3}(,[0-9]{3})$/.test(value)
  if (containsOnlyThousands) return Number(value.replace(/,/g, ''))

  const separatorChars = value
    .replace(/[^,.]/g, '')
    .split('')

  if ( // thousandSep is `.` and decimal mark is `,`
    separatorChars.shift() === '.' &&
    separatorChars.pop() === ','
  ) {
    return Number(
      value
        .replace('.', '')
        .replace(',', '.')
    )
  }

  const commaAsDecimalMark = /^[0-9+-]+,[0-9]{1,2}$/.test(value)
  if (commaAsDecimalMark) return Number(value.replace(/,(.+?)/, '.$1'))
}

function formatCurrency (value) {
  value = value.trim()
  const currencies = /EUR|€|HUF|SEK|\$|USD/
  const currencyPattern = `^[0-9+-., ]*(${currencies.source})[0-9+-., ]*$`
  const containsACurrency = new RegExp(currencyPattern)
    .test(value)

  if (!containsACurrency) return value

  const match = value.match(currencies)

  if (match) {
    const currency = match[0]
    const trimmedValue = value
      .replace(currency, '')
      .trim()

    const formattedNumber = formatNumber(trimmedValue)

    return `${formattedNumber || trimmedValue} ${currency}`
  }
}


module.exports = (options = {}) => {
  const {
    filePath,
    inPlace,
    readableStream,
  } = options
  let {writableStream} = options
  const config = {}

  function printCsv ({configGenerator, inputFilePath}) {
    const parser = csvParse({
      delimiter: configGenerator.mostFrequentDelimter,
    })
    parser.on('error', console.error)

    const stringifier = csvStringify()
    stringifier.on('error', console.error)

    fs
      .createReadStream(inputFilePath)
      .pipe(iconv.decodeStream(config.encoding))
      .pipe(parser)
      .pipe(formatter)
      .pipe(stringifier)
      .pipe(writableStream || process.stdout)
  }


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
      if (!config.encoding) {
        Object.assign(config, jschardet.detect(chunk))
      }

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


  class Formatter extends stream.Transform {
    constructor (opts = {}) {
      opts.objectMode = true
      super(opts)
    }

    _transform (row, chunkEncoding, chunkIsProcessedCb) {
      const formattedRow = row
        .map(cell => {
          const date = formatDate(cell)
          if (date) return date

          const number = formatNumber(cell)
          if (number) return number

          const currency = formatCurrency(cell)
          if (currency) return currency

          return cell
        })

      this.push(formattedRow)
      chunkIsProcessedCb()
    }
  }

  const formatter = new Formatter()


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
    })
  }

  configGenerator.on('finish', syncStreams)
  readableStream
    .pipe(configGenerator)

  writableTempFile.on('finish', syncStreams)
  readableStream
    .pipe(writableTempFile)
}
